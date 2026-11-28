#!/bin/bash
# Watch the health of the K3s server VM after `make up`.
# Every 15 s it records memory, CPU and I/O pressure, disk activity, the busiest
# processes and the last K3s journal lines of rpodackS into watch_rpodackS.log,
# next to the Vagrantfile. A sample that times out is logged as UNREACHABLE with
# the time, which is the moment we want to know.
#
#   scripts/watch_server.sh            # 5 minutes
#   scripts/watch_server.sh 900        # 15 minutes
#   make watch                         # same as the first
#
# Run it from p1 on the host VM, right after make up. Ctrl-C stops it early.
set -u
DURATION="${1:-300}"
LOG="watch_rpodackS.log"
NODE="rpodackS"
END=$(( $(date +%s) + DURATION ))

sample='
echo "--- $(date +%T) load $(cut -d" " -f1-3 /proc/loadavg)"
free -m | sed -n "2,3p"
echo "pressure: cpu $(cut -d" " -f2 /proc/pressure/cpu) | memory $(cut -d" " -f2 /proc/pressure/memory | head -1) | io $(cut -d" " -f2 /proc/pressure/io | head -1)"
awk "/ vda /{printf \"disk vda: reads %s writes %s ms-busy %s\n\", \$4, \$8, \$13}" /proc/diskstats
ps -eo pcpu,pmem,rss,comm --sort=-pcpu | head -4 | tail -3
sudo journalctl -u k3s --no-pager -n 3 -o short 2>/dev/null | cut -c1-200
'

echo "watching $NODE for ${DURATION}s, log: $LOG"
: > "$LOG"
while [ "$(date +%s)" -lt "$END" ]; do
  if ! timeout 20 vagrant ssh "$NODE" -c "$sample" 2>/dev/null >> "$LOG"; then
    echo "--- $(date +%T) UNREACHABLE (vagrant ssh timed out or failed)" | tee -a "$LOG"
  else
    tail -n +1 "$LOG" | grep -E '^--- ' | tail -1
  fi
  sleep 15
done
echo "done, see $LOG"
