---
title: Proxmox Debian Cloud-Init Template
short: Create a Debian cloud-init template for easy VM deployment in Proxmox
date: 2024-09-25
---

This guide will walk you through the process of creating a Debian Bookworm cloud-init template in Proxmox, allowing for quick and easy deployment of customized Debian VMs.

## Prerequisites

- Proxmox VE 7.0 or later
- Internet connection on the Proxmox host

## Steps

1. Download Debian Bookworm cloud image:

```bash
wget https://cloud.debian.org/images/cloud/bookworm/latest/debian-12-generic-amd64.qcow2
```

2. Create a new VM:

```bash
qm create 9000 --memory 2048 --cores 2 --name debian-cloud --net0 virtio,bridge=vmbr0
```

3. Import the disk to local-lvm storage:

```bash
qm importdisk 9000 debian-12-generic-amd64.qcow2 local-lvm
```

4. Attach the new disk to the VM as scsi0:

```bash
qm set 9000 --scsihw virtio-scsi-pci --scsi0 local-lvm:vm-9000-disk-0
```

5. Add cloud-init drive:

```bash
qm set 9000 --ide2 local-lvm:cloudinit
```

6. Make the cloud-init drive bootable and restrict BIOS to boot from disk only:

```bash
qm set 9000 --boot c --bootdisk scsi0
```

7. Add serial console:

```bash
qm set 9000 --serial0 socket --vga serial0
```

8. Enable QEMU guest agent:

```bash
qm set 9000 --agent enabled=1
```

9. Configure cloud-init:

```bash
qm set 9000 --ciuser your_username
qm set 9000 --cipassword your_password
qm set 9000 --sshkeys ~/.ssh/id_rsa.pub
```

Replace `your_username`, `your_password`, and the SSH key path with your desired values.

10. Configure network to use DHCP:

```bash
qm set 9000 --ipconfig0 ip=dhcp
```

11. Convert the VM to a template:

```bash
qm template 9000
```


## Using the Template

To create a new VM from this template:

1. Go to the Proxmox web interface
2. Select "Create VM"
3. Choose "From Template" and select your newly created template
4. Adjust any settings as needed
5. Finish the creation process

Your new VM will be created with the predefined settings and cloud-init configuration.

## Conclusion

You now have a Debian Bookworm cloud-init template in Proxmox. This template allows you to quickly deploy customized Debian VMs with pre-configured settings, saving time and ensuring consistency across your virtual machines.
