#!/bin/bash

PREVIOUS_ENV=$1
THRESHOLD=5
WATCH_SECONDS=120
INTERVAL=15
ELAPSED=0

CURRENT=$(kubectl get service bluegreen-service \
  -o jsonpath='{.spec.selector.version}')

echo "Watching error rate for ${WATCH_SECONDS}s"
echo "Current live environment: ${CURRENT}"
echo "Will roll back to ${PREVIOUS_ENV} if error rate exceeds ${THRESHOLD}%"

while [ $ELAPSED -lt $WATCH_SECONDS ]; do
  sleep $INTERVAL
  ELAPSED=$((ELAPSED + INTERVAL))

  # Check error rate directly from pod metrics via kubectl exec
  # This bypasses the ingress and checks pods directly
  TOTAL=0
  ERRORS=0

  for POD in $(kubectl get pods -l version=${CURRENT} \
    -o jsonpath='{.items[*].metadata.name}'); do
    RESPONSE=$(kubectl exec $POD -- \
      wget -qO- http://localhost:3000/health 2>&1)
    TOTAL=$((TOTAL + 1))
    if echo "$RESPONSE" | grep -q "unhealthy\|500\|error"; then
      ERRORS=$((ERRORS + 1))
    fi
  done

  if [ $TOTAL -eq 0 ]; then
    echo "Check at ${ELAPSED}s: No pods found"
    continue
  fi

  ERROR_RATE=$(( (ERRORS * 100) / TOTAL ))
  echo "Check at ${ELAPSED}s: ${ERRORS}/${TOTAL} pods unhealthy (${ERROR_RATE}%)"

  if [ $ERROR_RATE -gt $THRESHOLD ]; then
    echo "ERROR RATE ${ERROR_RATE}% EXCEEDS THRESHOLD ${THRESHOLD}%"
    echo "Rolling back to ${PREVIOUS_ENV}..."
    kubectl patch service bluegreen-service \
      -p "{\"spec\":{\"selector\":{\"app\":\"bluegreen-app\",\"version\":\"${PREVIOUS_ENV}\"}}}"
    echo "Rolled back to ${PREVIOUS_ENV} at ${ELAPSED}s"
    exit 1
  fi

  echo "Error rate ${ERROR_RATE}% is within threshold. Continuing."
done

echo "No issues detected after ${WATCH_SECONDS}s. Release is stable."
exit 0
