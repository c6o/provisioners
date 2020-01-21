FROM rastasheep/ubuntu-sshd:16.04 AS needs-squashing

# Install basic stuff
RUN apt-get update
RUN apt-get -y install git
RUN apt-get -y install curl

# Install kubectl
RUN apt-get install -y apt-transport-https
RUN curl -s https://packages.cloud.google.com/apt/doc/apt-key.gpg | apt-key add -
RUN touch /etc/apt/sources.list.d/kubernetes.list
RUN echo "deb https://apt.kubernetes.io/ kubernetes-xenial main" | tee -a /etc/apt/sources.list.d/kubernetes.list
RUN apt-get update
RUN apt-get install -y kubectl

# Set path to ssh keys to the data folder
RUN echo "AuthorizedKeysFile /data/.ssh/authorized_keys" >> /etc/ssh/sshd_config
RUN echo "IdentityFile /data/.ssh/id_rsa" >> /etc/ssh/ssh_config

# Remove root password
RUN passwd -d root

FROM scratch
COPY --from=needs-squashing / /
EXPOSE 22
CMD    ["/usr/sbin/sshd", "-D"]