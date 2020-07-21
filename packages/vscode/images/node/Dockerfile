FROM c6oio/base-dev AS needs-squashing

# Install nodejs
RUN curl -sL https://deb.nodesource.com/setup_12.x | bash -
RUN apt-get -y install nodejs
RUN npm install -g yarn

FROM scratch
COPY --from=needs-squashing / /
EXPOSE 22
CMD    ["/usr/sbin/sshd", "-D"]