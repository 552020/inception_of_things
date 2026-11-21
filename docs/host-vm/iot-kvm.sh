#!/bin/bash
# Boot the Inception-of-Things host VM under QEMU/KVM instead of VirtualBox.
# No root, no libvirt: plain qemu-system-x86_64 with /dev/kvm (ACL on the 42 host).
#
#   ./iot-kvm.sh            window on the desktop (GTK display)
#   ./iot-kvm.sh headless   no window; use ssh -p 2222 slombard@localhost
#
# Disk: qcow2 converted from the VirtualBox VDI. -cpu host passes VT-x through,
# so KVM works inside the guest (nested virtualization, kvm_intel nested=Y).
set -e
DISK="${IOT_DISK:-$HOME/goinfre/VMs/IoT.qcow2}"
MEM="${IOT_MEM:-8192}"
CPUS="${IOT_CPUS:-6}"
SSH_PORT="${IOT_SSH_PORT:-2222}"

if [ "$1" = "headless" ]; then
  DISPLAY_OPTS=(-display none)
else
  DISPLAY_OPTS=(-display gtk,gl=off -device virtio-vga)
fi

exec qemu-system-x86_64 \
  -name IoT \
  -enable-kvm -cpu host -smp "$CPUS" -m "$MEM" \
  -machine q35,accel=kvm \
  -drive file="$DISK",format=qcow2,if=virtio,cache=writeback,discard=unmap \
  -netdev user,id=net0,hostfwd=tcp:127.0.0.1:${SSH_PORT}-:22,hostfwd=tcp:127.0.0.1:8080-:8080,hostfwd=tcp:127.0.0.1:8888-:8888,hostfwd=tcp:127.0.0.1:30007-:30007 \
  -device virtio-net-pci,netdev=net0 \
  -device virtio-balloon-pci \
  -device qemu-xhci -device usb-tablet -device usb-kbd \
  -rtc base=utc,clock=host \
  "${DISPLAY_OPTS[@]}" \
  -monitor unix:"$HOME/goinfre/VMs/IoT.monitor",server,nowait \
  -serial none \
  -pidfile "$HOME/goinfre/VMs/IoT.pid" \
  "${@:2}"
