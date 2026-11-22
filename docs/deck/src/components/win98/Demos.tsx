"use client";
import { useState } from "react";

export function TabsDemo() {
  const tabs = ["General", "Network", "Advanced"];
  const [open, setOpen] = useState(0);
  const body = [
    "The host VM runs under QEMU with KVM. Part 1 and Part 2 start their machines through libvirt inside it.",
    "Two machines on a private network: 192.168.56.110 for the server, 192.168.56.111 for the agent.",
    "Nested virtualization has to be switched on in the host VM; check it with grep -c vmx /proc/cpuinfo.",
  ];
  return (
    <div>
      <div className="w98-tabs" role="tablist">
        {tabs.map((t, i) => (
          <button key={t} role="tab" aria-selected={open === i} className="w98-tab" onClick={() => setOpen(i)}>
            {t}
          </button>
        ))}
      </div>
      <div className="w98-tabpanel" role="tabpanel">
        {body[open]}
      </div>
    </div>
  );
}

export function ListDemo() {
  const rows = [
    ["Study document for the oral", "Study", "12 KB"],
    ["VM Setup and Maintenance", "Host VM", "9 KB"],
    ["Vagrant Primer", "Host VM", "5 KB"],
    ["Ideas from the yli branch", "Issues", "2 KB"],
  ];
  const [sel, setSel] = useState(1);
  return (
    <div className="w98-list">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Group</th>
            <th>Size</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r[0]} aria-selected={sel === i} onClick={() => setSel(i)}>
              {r.map((c) => (
                <td key={c}>{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
