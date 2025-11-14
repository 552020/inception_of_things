# base host container for Vagrant
FROM ubuntu:22.04

# install dependencies
RUN apt-get update && \
    apt-get install -y curl sudo vim systemd iproute2 iptables \
                       ca-certificates gnupg software-properties-common && \
    rm -rf /var/lib/apt/lists/*

# install Vagrant (from official HashiCorp repo)
RUN curl -fsSL https://apt.releases.hashicorp.com/gpg | sudo apt-key add - && \
    apt-add-repository "deb [arch=amd64] https://apt.releases.hashicorp.com $(lsb_release -cs) main" && \
    apt-get update && \
    apt-get install -y vagrant && \
    rm -rf /var/lib/apt/lists/*

# create non-root user with sudo
RUN useradd -m student && echo "student:student" | chpasswd && adduser student sudo
# Create docker group and add student
RUN sudo groupadd -f docker && sudo usermod -aG docker student



# USER student
WORKDIR /home/student/vagrant-test
COPY Vagrantfile .
CMD ["/bin/bash"]
