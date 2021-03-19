# Requires access to kubectl and helm commands.
FROM dtzar/helm-kubectl

# Set Kustomize version
ENV KUSTOMIZE_VERSION=3.8.1

# Download and install kustomize script, required for post-renderer.
RUN curl -sLf https://github.com/kubernetes-sigs/kustomize/releases/download/kustomize%2Fv${KUSTOMIZE_VERSION}/kustomize_v${KUSTOMIZE_VERSION}_linux_amd64.tar.gz -o kustomize.tar.gz\
    && tar xf kustomize.tar.gz \
    && mv kustomize /usr/local/bin \
    && chmod +x /usr/local/bin/kustomize \
    && rm -rf ./*

CMD bash