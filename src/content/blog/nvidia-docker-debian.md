---
title: NVIDIA GPU Support with Docker on Debian
short: Complete guide for setting up NVIDIA-enabled containers on Debian
date: 2024-09-24
type: BlogPost
---

This guide walks you through the process of setting up NVIDIA GPU support for Docker containers on a Debian system.

## Prerequisites

- Debian-based system (tested on Debian 12 Bookworm)
- NVIDIA GPU
- Root or sudo access

## Installation Steps

### 1. Add Required Repositories

First, we need to add the `contrib` and `non-free` components to the Debian repositories:

```bash
sudo apt update && sudo apt install software-properties-common -y
sudo apt-add-repository --component contrib non-free -y
```

### 2. Install NVIDIA Drivers

Install the necessary NVIDIA drivers and CUDA toolkit:

```bash
sudo apt update && sudo apt install -y \
    clinfo \
    nvidia-cuda-toolkit \
    nvidia-smi
```

### 3. Install Docker

Install Docker using the official installation script:

```bash
curl -fsSL https://get.docker.com | sudo sh
```

### 4. Install NVIDIA Container Toolkit

Add the NVIDIA Container Toolkit repository and install the required packages:

```bash
# Add NVIDIA GPG key
curl -fsSL https://nvidia.github.io/libnvidia-container/gpgkey | sudo gpg --dearmor -o /usr/share/keyrings/nvidia-container-toolkit-keyring.gpg

# Add NVIDIA repository
curl -s -L https://nvidia.github.io/libnvidia-container/stable/deb/nvidia-container-toolkit.list | \
    sed 's#deb https://#deb [signed-by=/usr/share/keyrings/nvidia-container-toolkit-keyring.gpg] https://#g' | \
    sudo tee /etc/apt/sources.list.d/nvidia-container-toolkit.list

# Install NVIDIA Container Toolkit
sudo apt update && sudo apt install -y \
    nvidia-container-toolkit \
    nvidia-container-runtime
```

### 5. Configure Docker to Use NVIDIA Runtime

Configure the NVIDIA Container Toolkit and restart Docker:

```bash
sudo nvidia-ctk runtime configure --runtime=docker
sudo systemctl restart docker
```

## Verification

To verify that NVIDIA GPU support is working correctly with Docker, run the following command:

```bash
sudo docker run --rm --gpus all nvidia/cuda:11.6.2-base-ubuntu20.04 nvidia-smi
```

This command should display information about your NVIDIA GPU, confirming that the setup is working correctly.

## Troubleshooting

If you encounter any issues:

1. Ensure all packages are up to date: `sudo apt update && sudo apt upgrade -y`
2. Verify NVIDIA drivers are installed correctly: `nvidia-smi`
3. Check Docker status: `sudo systemctl status docker`
4. Review Docker logs: `sudo journalctl -u docker`

## Conclusion

You now have a Debian system configured to run Docker containers with NVIDIA GPU support. This setup allows you to leverage your GPU's power in containerized applications, perfect for video encoding, AI, and other GPU-intensive tasks.


## Extra

```yaml
services:
  ollama:
    volumes:
      - ./ollama:/root/.ollama
    container_name: ollama
    pull_policy: always
    tty: true
    restart: always
    image: ollama/ollama:latest
    ports:
      - 7869:11434
    environment:
      - OLLAMA_KEEP_ALIVE=24h
    networks:
      - ollama-docker
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: all
              capabilities: [gpu]

  ollama-webui:
    image: ghcr.io/open-webui/open-webui:main
    container_name: ollama-webui
    volumes:
      - ./ollama_web:/app/backend/data
    depends_on:
      - ollama
    ports:
      - 8080:8080
    environment: # https://docs.openwebui.com/getting-started/env-configuration#default_models
      - OLLAMA_BASE_URLS=http://host.docker.internal:7869 #comma separated ollama hosts
      - ENV=prod
      - WEBUI_NAME=your.domain.com
      - WEBUI_AUTH=True
      - WEBUI_URL=http://localhost:8080
      - WEBUI_SECRET_KEY=t0p-s33333cr33333t
    extra_hosts:
      - host.docker.internal:host-gateway
    restart: always
    networks:
      - ollama-docker

networks:
  ollama-docker:
    external: false
```
