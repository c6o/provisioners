FROM openjdk:8-jre

WORKDIR /opt/oxd/

RUN wget http://ox.gluu.org/maven/org/xdi/oxd-server/3.1.4.Final/oxd-server-3.1.4.Final-distribution.zip
RUN unzip oxd-server-3.1.4.Final-distribution.zip
RUN chmod +x bin/oxd-start.sh

COPY oxd-conf.json /etc/oxd/oxd-server/oxd-conf.json

EXPOSE 8099 8099

CMD ["bin/oxd-start.sh"]

