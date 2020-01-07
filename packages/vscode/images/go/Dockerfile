FROM traxitt/base-dev AS needs-squashing

## The following gets the latest version of golang
# RUN apt-get -y install software-properties-common
# RUN apt-get update
# RUN add-apt-repository ppa:longsleep/golang-backports
# RUN apt-get update
# RUN apt-get -y install golang-go

## https://www.linode.com/docs/development/go/install-go-on-ubuntu/
RUN curl -O https://storage.googleapis.com/golang/go1.12.9.linux-amd64.tar.gz
RUN tar -xvf go1.12.9.linux-amd64.tar.gz
RUN rm go1.12.9.linux-amd64.tar.gz
RUN chown -R root:root ./go
RUN mv go /usr/local

RUN echo "export GOPATH=/data/go" >> /root/.bashrc
RUN echo "export PATH=\$PATH:/usr/local/go/bin:\$GOPATH/bin" >> /root/.bashrc

FROM scratch

WORKDIR /data

COPY --from=needs-squashing / /
EXPOSE 22
CMD    ["/usr/sbin/sshd", "-D"]