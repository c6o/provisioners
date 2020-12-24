import { baseProvisionerType } from '../'

export const createApplyMixin = (base: baseProvisionerType) => class extends base {
    externalIPAddress
    SYSTEM_GATEWAY_NAME = 'system-gateway'

    async createApply() {
        this.spec.tag = this.spec.tag || 'canary'

        await this.ensureServiceNamespacesExist()
        await this.provisionSystem()
        await this.provisionApps()
        await this.provisionOAuth()
        await this.provisionDock()
        await this.provisionGateway()
        await this.provisionRoutes()
        await this.provisionCertificate()
        await this.provisionUpdate()
        await this.patchCluster()
    }

    gatewayServers = [{
        port: {
            name: 'http-istio-gateway',
            number: 80,
            protocol: 'HTTP'
        },
        hosts: ['*'],
        tls: {
            httpsRedirect: true
        }
    },
    {
        port: {
            name: 'https-istio-gateway',
            number: 443,
            protocol: 'HTTPS'
        },
        hosts: ['*'],
        tls: {
            mode: 'SIMPLE',
            credentialName: 'cluster-certificate-tls'
        }
    }]

    traxittNamespace = {
        kind: 'Namespace',
        metadata: {
            name: 'c6o-system'
        }
    }

    traxittNamespacePatch = {
        metadata: {
            annotations: {
                'system.codezero.io/display': 'System',
                'system.codezero.io/icon': '<svg width="256" height="256" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg"><g filter="url(#filter0_d)"><path d="M252.932 78.656C252.92 78.52 252.905 78.386 252.89 78.251C252.85 77.919 252.8 77.59 252.74 77.265C252.702 77.062 252.66 76.86 252.614 76.66C252.55 76.383 252.482 76.108 252.403 75.838C252.335 75.602 252.258 75.369 252.179 75.138C252.138 75.021 252.095 74.905 252.052 74.789C251.73 73.922 251.332 73.095 250.863 72.312L247.842 67.278C245.543 63.465 241.606 60.749 237.001 60.132V59C237.001 56.953 236.384 55.052 235.329 53.467L233.323 50.457C231.53 47.771 228.473 46 225.001 46H130.973C125.921 46 121.276 43.226 118.881 38.778L113.23 28.285C111.477 25.03 108.079 23 104.382 23H29.0004C25.5284 23 22.4714 24.771 20.6784 27.457L18.6734 30.465C17.6184 32.051 17.0004 33.953 17.0004 36V89.544C13.2654 90.581 10.1174 93.031 8.1594 96.28L5.1324 101.325C4.6664 102.104 4.2714 102.927 3.9504 103.789C3.9074 103.904 3.8644 104.018 3.8244 104.134C3.7444 104.367 3.6674 104.6 3.5984 104.838C3.5194 105.109 3.4504 105.384 3.3874 105.661C3.3414 105.862 3.2994 106.064 3.2614 106.268C3.2004 106.592 3.1504 106.92 3.1114 107.251C3.0954 107.386 3.0814 107.521 3.0694 107.656C3.0294 108.099 3.0014 108.546 3.0014 109C3.0014 111.944 3.7624 115.348 4.2064 118.255C4.6894 121.411 5.1514 124.57 5.5954 127.732C6.8224 136.468 7.9154 145.226 8.8214 154.008C9.1944 157.623 9.5334 161.242 9.8314 164.865C10.9104 177.975 11.7084 191.111 12.3634 204.253C12.5484 207.959 12.6974 211.666 12.8664 215.372C13.0014 218.126 13.0104 220.839 14.0254 223.442C15.7254 227.803 19.4754 231.202 23.9864 232.455C25.2924 232.818 26.6464 233 28.0014 233H226.665C231.152 233 235.499 231.109 238.336 227.634C241.106 224.24 241.92 220.281 242.056 216.067C242.324 207.279 242.682 198.494 243.111 189.713C243.763 176.337 244.58 162.968 245.671 149.624C246.612 138.097 247.798 126.592 249.049 115.099C250.046 105.944 251.095 96.795 252.193 87.653C252.494 85.154 253.001 82.524 253.001 80C253 79.546 252.972 79.1 252.932 78.656Z" fill="black" fill-opacity="0.01"/></g><path d="M235.328 53.467L233.322 50.457C231.529 47.771 228.472 46 225 46H130.972C125.92 46 121.275 43.226 118.88 38.778L113.23 28.285C111.477 25.03 108.079 23 104.382 23H29C25.528 23 22.471 24.771 20.678 27.457L18.673 30.465C17.618 32.051 17 33.953 17 36V94H19H110H149H235H237V59C237 56.953 236.383 55.052 235.328 53.467Z" fill="#E8AC23"/><g filter="url(#filter1_i)"><path d="M227 49H130.972C125.92 49 121.275 46.226 118.88 41.778L113.23 31.285C111.477 28.03 108.079 26 104.383 26H27C21.477 26 17 30.477 17 36V94H110H149H237V59C237 53.477 232.523 49 227 49Z" fill="url(#paint0_linear)"/></g><g filter="url(#filter2_i)"><path d="M235.328 53.467L233.322 50.457C231.529 47.771 228.472 46 225 46H130.972C125.92 46 121.275 43.226 118.88 38.778L113.23 28.285C111.477 25.03 108.079 23 104.382 23H29C25.528 23 22.471 24.771 20.678 27.457L18.673 30.465C17.618 32.051 17 33.953 17 36V94H19H110H149H235H237V59C237 56.953 236.383 55.052 235.328 53.467Z" fill="black" fill-opacity="0.01"/></g><g filter="url(#filter3_d)"><path d="M230 94V59C230 56.791 228.209 55 226 55H34C31.791 55 30 56.791 30 59V60H28C25.791 60 24 61.791 24 64V94H230Z" fill="black" fill-opacity="0.01"/></g><g filter="url(#filter4_i)"><path d="M32 94H24V64C24 61.791 25.791 60 28 60H32V94Z" fill="url(#paint1_linear)"/><path d="M32 94H24V64C24 61.791 25.791 60 28 60H32V94Z" fill="black" fill-opacity="0.05"/><path d="M32 94H24V64C24 61.791 25.791 60 28 60H32V94Z" fill="url(#paint2_linear)" fill-opacity="0.2"/></g><g filter="url(#filter5_i)"><path d="M230 94H30V59C30 56.791 31.791 55 34 55H226C228.209 55 230 56.791 230 59V94Z" fill="url(#paint3_linear)"/></g><path d="M250.872 72.331L247.841 67.279C245.215 62.924 240.453 60 235 60H133.365C129.416 60 125.635 61.593 122.877 64.418L107.89 79.771C102.129 85.673 94.23 89 85.982 89H21C15.547 89 10.785 91.924 8.159 96.28L5.132 101.325C3.787 103.573 3 106.192 3 109C3 111.732 3.761 114.545 4.205 117.244C4.688 120.172 5.15 123.104 5.594 126.039C6.821 134.146 7.914 142.275 8.82 150.424C9.193 153.779 9.532 157.138 9.83 160.5C10.909 172.666 11.707 184.858 12.362 197.054C12.547 200.492 12.696 203.933 12.865 207.372C13 210.126 13.009 212.839 14.024 215.442C15.724 219.803 19.474 223.202 23.985 224.455C25.291 224.818 26.645 225 28 225H226.664C231.151 225 235.498 223.109 238.335 219.634C241.105 216.24 241.919 212.281 242.055 208.067C242.323 199.792 242.681 191.519 243.11 183.25C243.762 170.655 244.579 158.065 245.67 145.5C246.611 134.645 247.797 123.812 249.048 112.989C250.045 104.368 251.094 95.753 252.192 87.144C252.493 84.791 253 82.377 253 80C253 77.195 252.214 74.578 250.872 72.331Z" fill="#FFDB89"/><mask id="mask0" mask-type="alpha" maskUnits="userSpaceOnUse" x="3" y="60" width="250" height="174"><path fill-rule="evenodd" clip-rule="evenodd" d="M5.51576 100.685C3.92666 103.066 3 105.925 3 109C3 111.203 3.4254 113.663 3.82602 115.979C3.96088 116.759 4.09293 117.523 4.205 118.255C4.688 121.411 5.15 124.57 5.594 127.732C6.821 136.468 7.915 145.227 8.82 154.008C9.193 157.623 9.533 161.242 9.83 164.866C10.908 177.976 11.708 191.112 12.362 204.254C12.481 206.638 12.5852 209.023 12.6893 211.408C12.747 212.729 12.8047 214.051 12.865 215.373C12.8798 215.674 12.893 215.975 12.9063 216.275C13.014 218.719 13.1201 221.125 14.024 223.443C15.724 227.804 19.474 231.203 23.985 232.456C25.291 232.819 26.645 233.001 28 233.001L226.664 233C231.151 233 235.498 231.109 238.335 227.634C241.105 224.24 241.919 220.281 242.055 216.067C242.323 207.279 242.682 198.494 243.11 189.713C243.762 176.337 244.579 162.968 245.67 149.624C246.612 138.097 247.797 126.592 249.048 115.099C250.045 105.944 251.095 96.795 252.192 87.653C252.275 86.9634 252.374 86.2638 252.473 85.5592C252.734 83.7106 253 81.8275 253 80C253 76.928 252.075 74.0707 250.488 71.6916L247.841 67.279C245.215 62.924 240.453 60 235 60H133.365C129.416 60 125.635 61.593 122.877 64.418L107.89 79.771C102.129 85.673 94.23 89 85.982 89H21C15.547 89 10.785 91.924 8.159 96.28L5.51576 100.685Z" fill="#C4C4C4"/></mask><g mask="url(#mask0)"><g filter="url(#filter6_d)"><path d="M226.664 233C231.151 233 235.498 231.109 238.335 227.634C241.105 224.24 241.919 220.281 242.055 216.067C242.323 207.279 242.682 198.494 243.11 189.713C243.762 176.337 244.579 162.968 245.67 149.624C246.612 138.097 247.797 126.592 249.048 115.099C250.045 105.944 251.095 96.795 252.192 87.653C252.493 85.154 253 82.524 253 80C253 71.72 246.28 65 238 65H133.365C129.417 65 125.635 66.593 122.877 69.418L107.89 84.771C102.129 90.673 94.23 94 85.982 94H18C9.72 94 3 100.72 3 109C3 111.944 3.76 115.348 4.205 118.255C4.688 121.411 5.15 124.57 5.594 127.732C6.821 136.468 7.915 145.227 8.82 154.008C9.193 157.623 9.533 161.242 9.83 164.866C10.908 177.976 11.708 191.112 12.362 204.254C12.547 207.959 12.696 211.666 12.865 215.373C13 218.127 13.009 220.84 14.024 223.443C15.724 227.804 19.474 231.203 23.985 232.456C25.291 232.819 26.645 233.001 28 233.001L226.664 233Z" fill="white" fill-opacity="0.01"/></g></g><g filter="url(#filter7_i)"><path d="M226.664 233C231.151 233 235.498 231.109 238.335 227.634C241.105 224.24 241.919 220.281 242.055 216.067C242.323 207.279 242.682 198.494 243.11 189.713C243.762 176.337 244.579 162.968 245.67 149.624C246.612 138.097 247.797 126.592 249.048 115.099C250.045 105.944 251.095 96.795 252.192 87.653C252.493 85.154 253 82.524 253 80C253 71.72 246.28 65 238 65H133.365C129.417 65 125.635 66.593 122.877 69.418L107.89 84.771C102.129 90.673 94.23 94 85.982 94H18C9.72 94 3 100.72 3 109C3 111.944 3.76 115.348 4.205 118.255C4.688 121.411 5.15 124.57 5.594 127.732C6.821 136.468 7.915 145.227 8.82 154.008C9.193 157.623 9.533 161.242 9.83 164.866C10.908 177.976 11.708 191.112 12.362 204.254C12.547 207.959 12.696 211.666 12.865 215.373C13 218.127 13.009 220.84 14.024 223.443C15.724 227.804 19.474 231.203 23.985 232.456C25.291 232.819 26.645 233.001 28 233.001L226.664 233Z" fill="url(#paint4_linear)"/></g><g filter="url(#filter8_d)"><path d="M132.905 113.91C110.036 113.91 96.8702 122.221 96.3211 122.575C94.9366 123.468 93.9482 124.927 93.6512 126.549C87.3779 160.702 100.032 180.85 100.574 181.691C101.466 183.073 102.925 184.055 104.543 184.351C110.828 185.505 117.077 186.09 123.118 186.09C145.98 186.09 159.145 177.779 159.695 177.424C161.079 176.534 162.069 175.06 162.366 173.441C164.917 159.551 164.632 145.81 161.542 133.702C160.709 130.436 159.66 127.22 158.353 124.112C157.624 122.379 156.821 120.67 155.883 119.039C154.894 117.32 153.499 116.018 151.487 115.648C145.199 114.496 138.948 113.91 132.905 113.91Z" fill="black" fill-opacity="0.01"/></g><g filter="url(#filter9_ii)"><path d="M132.905 113.91C110.036 113.91 96.8702 122.221 96.3211 122.576C94.9366 123.468 93.9482 124.927 93.6512 126.549C87.3779 160.703 100.032 180.85 100.574 181.691C101.466 183.073 102.925 184.055 104.543 184.351C110.828 185.505 117.077 186.09 123.118 186.09C145.98 186.09 159.145 177.779 159.695 177.425C161.079 176.534 162.069 175.06 162.366 173.442C164.917 159.551 164.632 145.81 161.542 133.702C160.709 130.436 159.66 127.22 158.353 124.112C157.624 122.379 156.821 120.67 155.883 119.039C154.894 117.32 153.499 116.018 151.487 115.649C145.199 114.496 138.948 113.91 132.905 113.91Z" fill="white"/><path d="M132.905 113.91C110.036 113.91 96.8702 122.221 96.3211 122.576C94.9366 123.468 93.9482 124.927 93.6512 126.549C87.3779 160.703 100.032 180.85 100.574 181.691C101.466 183.073 102.925 184.055 104.543 184.351C110.828 185.505 117.077 186.09 123.118 186.09C145.98 186.09 159.145 177.779 159.695 177.425C161.079 176.534 162.069 175.06 162.366 173.442C164.917 159.551 164.632 145.81 161.542 133.702C160.709 130.436 159.66 127.22 158.353 124.112C157.624 122.379 156.821 120.67 155.883 119.039C154.894 117.32 153.499 116.018 151.487 115.649C145.199 114.496 138.948 113.91 132.905 113.91Z" fill="url(#paint5_linear)" fill-opacity="0.02"/></g><path d="M151.514 115.501L151.514 115.501C145.218 114.347 138.957 113.76 132.905 113.76C109.999 113.76 96.8054 122.085 96.2398 122.45C94.8211 123.364 93.8083 124.858 93.5036 126.522C87.2214 160.725 99.8925 180.911 100.448 181.772C101.362 183.189 102.857 184.195 104.516 184.499C110.81 185.655 117.068 186.24 123.118 186.24C146.017 186.24 159.21 177.915 159.776 177.551C161.195 176.638 162.209 175.128 162.514 173.469C165.068 159.559 164.783 145.797 161.688 133.665C160.852 130.393 159.802 127.17 158.492 124.054C157.761 122.317 156.955 120.602 156.013 118.964C155.01 117.22 153.582 115.881 151.514 115.501Z" stroke="black" stroke-opacity="0.1" stroke-width="0.3" stroke-linejoin="round"/><path d="M99.5626 127.613C108.391 132.517 116.5 136.445 123.602 139.571C129.243 142.058 134.245 144.036 138.431 145.581C141.562 138.484 145.495 130.366 150.395 121.543C118.166 115.627 99.5626 127.613 99.5626 127.613Z" fill="url(#paint6_linear)"/><path d="M156.437 172.385C143.961 165.414 130.97 159.407 117.578 154.418C114.447 161.514 110.537 169.633 105.619 178.455C137.834 184.371 156.437 172.385 156.437 172.385Z" fill="url(#paint7_linear)"/><path d="M99.5812 127.627H99.5439C93.6273 159.844 105.61 178.446 105.61 178.446C110.537 169.633 114.447 161.514 117.578 154.418C120.07 148.768 122.048 143.761 123.602 139.572C116.5 136.446 108.391 132.517 99.5812 127.627Z" fill="url(#paint8_linear)"/><path d="M150.385 121.543C145.486 130.366 141.552 138.485 138.421 145.581C130.657 163.199 127.871 174.508 127.69 174.588C127.69 174.588 141.422 177.69 156.456 172.362C162.372 140.146 150.385 121.543 150.385 121.543Z" fill="url(#paint9_linear)"/><path d="M99.6046 127.628C108.414 132.517 116.524 136.446 123.602 139.572C126.868 130.707 128.198 125.458 128.319 125.411C128.338 125.411 114.62 122.313 99.6046 127.628Z" fill="url(#paint10_linear)"/><path d="M103.384 149.645C103.384 149.645 100.272 163.376 105.61 178.409C110.509 169.586 114.443 161.468 117.569 154.371C108.671 151.096 103.431 149.766 103.384 149.645Z" fill="url(#paint11_linear)" fill-opacity="0.8"/><path d="M127.69 174.588C127.69 174.588 141.403 177.686 156.423 172.376C147.614 167.482 139.504 163.553 132.412 160.427C129.141 169.301 127.802 174.541 127.69 174.588Z" fill="url(#paint12_linear)"/><path d="M150.371 121.543C145.472 130.362 141.538 138.48 138.412 145.581C147.301 148.847 152.55 150.186 152.597 150.307C152.597 150.312 155.7 136.576 150.371 121.543Z" fill="url(#paint13_linear)"/><path d="M150.39 121.551C150.391 121.549 150.393 121.546 150.395 121.543C118.166 115.627 99.5624 127.613 99.5624 127.613L99.5436 127.628C93.6271 159.844 105.609 178.446 105.609 178.446L105.619 178.455C137.833 184.371 156.437 172.385 156.437 172.385L156.455 172.362C162.302 140.529 150.668 121.988 150.39 121.551ZM132.406 160.43C127.523 158.286 122.579 156.281 117.578 154.418C120.07 148.768 122.048 143.762 123.602 139.572C129.236 142.055 134.232 144.031 138.414 145.575C138.414 145.577 138.413 145.579 138.412 145.581C138.414 145.582 138.417 145.583 138.42 145.584C135.929 151.236 133.95 156.239 132.406 160.43Z" fill="url(#paint14_linear)" fill-opacity="0.08"/><path d="M112.94 122.542C121.579 120.295 134.227 118.781 150.268 121.711C151.031 122.943 161.952 141.279 156.283 172.259C156.248 172.281 156.194 172.314 156.123 172.357C155.981 172.442 155.767 172.567 155.483 172.724C154.916 173.038 154.067 173.481 152.948 173.994C150.71 175.022 147.388 176.331 143.061 177.457C134.421 179.704 121.771 181.218 105.73 178.284C105.708 178.249 105.677 178.198 105.638 178.133C105.552 177.99 105.428 177.777 105.271 177.493C104.957 176.925 104.514 176.077 104.001 174.958C102.974 172.719 101.665 169.398 100.54 165.071C98.2937 156.431 96.7806 143.782 99.7142 127.74L99.716 127.739C99.7514 127.717 99.8047 127.684 99.8758 127.641C100.018 127.556 100.232 127.431 100.516 127.274C101.083 126.96 101.932 126.517 103.051 126.004C105.29 124.977 108.612 123.667 112.94 122.542ZM132.331 160.602C132.378 160.623 132.432 160.623 132.48 160.603C132.527 160.583 132.565 160.544 132.583 160.495C134.126 156.307 136.103 151.308 138.592 145.66C138.612 145.614 138.613 145.562 138.595 145.515C138.59 145.502 138.584 145.491 138.577 145.48C138.555 145.442 138.521 145.413 138.48 145.398C134.301 143.856 129.308 141.882 123.678 139.4C123.63 139.379 123.576 139.378 123.529 139.399C123.481 139.419 123.444 139.458 123.426 139.506C121.873 143.693 119.896 148.696 117.406 154.342C117.385 154.389 117.384 154.443 117.405 154.491C117.425 154.539 117.464 154.576 117.512 154.594C122.51 156.456 127.451 158.46 132.331 160.602Z" stroke="black" stroke-opacity="0.15" stroke-width="0.3762" stroke-linejoin="round"/><g filter="url(#filter10_i)"><path d="M105.964 177.944C135.752 183.342 153.919 173.229 155.943 172.025C161.372 142.085 151.341 124.214 150.035 122.052C133.641 119.085 120.904 120.867 113.09 122.892C105.528 124.851 101.001 127.408 100.054 127.974C97.0842 144.368 98.8651 157.106 100.89 164.92C102.842 172.455 105.386 176.975 105.964 177.944Z" fill="white" fill-opacity="0.01"/></g><mask id="mask1" mask-type="alpha" maskUnits="userSpaceOnUse" x="97" y="119" width="62" height="62"><path d="M150.39 121.551C150.391 121.549 150.393 121.546 150.395 121.543C118.166 115.627 99.5624 127.613 99.5624 127.613L99.5436 127.628C93.6271 159.844 105.609 178.446 105.609 178.446L105.619 178.455C137.833 184.371 156.437 172.385 156.437 172.385L156.455 172.362C162.302 140.529 150.668 121.988 150.39 121.551ZM132.406 160.43C127.523 158.286 122.579 156.281 117.578 154.418C120.07 148.768 122.048 143.762 123.602 139.572C129.236 142.055 134.232 144.031 138.414 145.575C138.414 145.577 138.413 145.579 138.412 145.581C138.414 145.582 138.417 145.583 138.42 145.584C135.929 151.236 133.95 156.239 132.406 160.43Z" fill="#C4C4C4"/></mask><g mask="url(#mask1)"><g filter="url(#filter11_d)"><path d="M132.406 160.994C132.329 160.994 132.251 160.978 132.179 160.946C127.322 158.814 122.343 156.795 117.381 154.947C117.235 154.892 117.118 154.781 117.058 154.637C116.997 154.494 116.999 154.332 117.061 154.19C119.218 149.3 121.241 144.316 123.073 139.376C123.127 139.23 123.239 139.113 123.382 139.053C123.525 138.992 123.687 138.993 123.829 139.056C128.781 141.239 133.754 143.254 138.609 145.046C138.751 145.098 138.865 145.205 138.928 145.342C138.929 145.346 138.931 145.349 138.933 145.352C138.998 145.498 139.001 145.666 138.937 145.812C136.74 150.796 134.721 155.78 132.935 160.625C132.882 160.771 132.77 160.889 132.627 160.95C132.556 160.979 132.481 160.994 132.406 160.994Z" fill="white" fill-opacity="0.01"/></g></g><g filter="url(#filter12_i)"><path d="M150.39 121.551C150.391 121.549 150.393 121.546 150.395 121.543C118.166 115.627 99.5624 127.613 99.5624 127.613L99.5436 127.628C93.6271 159.844 105.609 178.446 105.609 178.446L105.619 178.455C137.833 184.371 156.437 172.385 156.437 172.385L156.455 172.362C162.302 140.529 150.668 121.988 150.39 121.551Z" fill="black" fill-opacity="0.01"/></g><path d="M150.227 121.704C155.111 135.574 152.817 148.279 152.457 150.056C152.237 149.98 151.856 149.855 151.235 149.668L151.235 149.668C149.113 149.026 144.686 147.679 138.479 145.399C134.3 143.857 129.307 141.882 123.677 139.4L123.677 139.4C116.655 136.309 108.648 132.433 99.9348 127.606C100.075 127.523 100.268 127.411 100.514 127.275C101.081 126.961 101.929 126.519 103.048 126.005C105.286 124.979 108.606 123.67 112.932 122.544C121.564 120.299 134.201 118.784 150.227 121.704Z" stroke="black" stroke-opacity="0.1" stroke-width="0.3762" stroke-linejoin="bevel"/><path d="M127.951 174.45C127.982 174.36 128.019 174.241 128.064 174.097C128.132 173.879 128.217 173.596 128.32 173.253C128.384 173.043 128.454 172.809 128.531 172.554C128.939 171.208 129.546 169.238 130.39 166.721C132.079 161.686 134.714 154.46 138.594 145.657C141.689 138.641 145.569 130.625 150.393 121.917C150.476 122.057 150.588 122.251 150.724 122.497C151.038 123.064 151.481 123.913 151.995 125.032C153.022 127.27 154.332 130.592 155.457 134.919C157.703 143.553 159.217 156.193 156.29 172.221C148.838 174.844 141.711 175.394 136.439 175.285C133.791 175.23 131.612 175.01 130.095 174.803C129.337 174.699 128.745 174.599 128.343 174.526C128.181 174.496 128.05 174.47 127.951 174.45Z" stroke="black" stroke-opacity="0.2" stroke-width="0.3762" stroke-linejoin="bevel"/><path d="M103.446 150.298C103.476 150.136 103.501 150.005 103.521 149.906C103.541 149.913 103.561 149.92 103.583 149.927C103.751 149.982 103.996 150.058 104.314 150.154C104.439 150.192 104.576 150.233 104.724 150.278C105.33 150.461 106.126 150.701 107.101 151.005C109.519 151.759 113.035 152.904 117.459 154.531L117.512 154.594C130.795 159.543 143.683 165.493 156.064 172.392C155.924 172.475 155.73 172.588 155.484 172.724C154.916 173.038 154.067 173.481 152.948 173.995C150.71 175.022 147.388 176.331 143.061 177.457C134.428 179.702 121.791 181.216 105.767 178.291C103.125 170.822 102.573 163.677 102.683 158.393C102.738 155.746 102.96 153.567 103.167 152.051C103.271 151.293 103.371 150.7 103.446 150.298Z" stroke="black" stroke-opacity="0.2" stroke-width="0.3762" stroke-linejoin="bevel"/><path d="M127.673 125.474C127.832 125.503 127.961 125.529 128.058 125.548C128.051 125.568 128.044 125.589 128.037 125.611C127.982 125.779 127.907 126.025 127.81 126.343C127.773 126.465 127.733 126.599 127.69 126.743C127.507 127.351 127.266 128.15 126.961 129.129C126.205 131.553 125.057 135.078 123.426 139.507C121.873 143.694 119.896 148.696 117.406 154.342C114.311 161.359 110.453 169.374 105.602 178.073C105.519 177.934 105.407 177.74 105.271 177.493C104.957 176.925 104.514 176.077 104.001 174.958C102.974 172.72 101.665 169.398 100.54 165.071C98.2964 156.441 96.7843 143.809 99.7054 127.792C107.172 125.156 114.316 124.605 119.596 124.715C122.24 124.77 124.415 124.99 125.927 125.197C126.683 125.3 127.273 125.4 127.673 125.474Z" stroke="black" stroke-opacity="0.06" stroke-width="0.3762" stroke-linejoin="bevel"/><defs><filter id="filter0_d" x="1.0014" y="22.33" width="254" height="214" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"/><feOffset dy="1.33"/><feGaussianBlur stdDeviation="1"/><feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2 0"/><feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow"/><feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/></filter><filter id="filter1_i" x="17" y="26" width="220" height="68.67" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/><feOffset dy="1"/><feGaussianBlur stdDeviation="0.335"/><feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/><feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.4 0"/><feBlend mode="normal" in2="shape" result="effect1_innerShadow"/></filter><filter id="filter2_i" x="17" y="23" width="220" height="71.33" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/><feOffset dy="0.33"/><feGaussianBlur stdDeviation="0.335"/><feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/><feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.3 0"/><feBlend mode="normal" in2="shape" result="effect1_innerShadow"/></filter><filter id="filter3_d" x="21" y="55" width="212" height="45" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"/><feOffset dy="3"/><feGaussianBlur stdDeviation="1.5"/><feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.3 0"/><feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow"/><feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/></filter><filter id="filter4_i" x="24" y="60" width="8" height="34" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/><feOffset dy="2"/><feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/><feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.5 0"/><feBlend mode="normal" in2="shape" result="effect1_innerShadow"/></filter><filter id="filter5_i" x="30" y="55" width="200" height="39" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/><feOffset dy="2"/><feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/><feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0"/><feBlend mode="normal" in2="shape" result="effect1_innerShadow"/></filter><filter id="filter6_d" x="3" y="63.67" width="250" height="169.331" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"/><feOffset dy="-1.33"/><feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.4 0"/><feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow"/><feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/></filter><filter id="filter7_i" x="3" y="64" width="250" height="169.001" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/><feOffset dy="-1"/><feGaussianBlur stdDeviation="1.5"/><feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/><feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.3 0"/><feBlend mode="normal" in2="shape" result="effect1_innerShadow"/></filter><filter id="filter8_d" x="90.58" y="113.58" width="74.84" height="74.84" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"/><feOffset dy="1"/><feGaussianBlur stdDeviation="0.665"/><feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2 0"/><feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow"/><feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/></filter><filter id="filter9_ii" x="91.6099" y="111.21" width="72.7801" height="75.18" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/><feOffset dy="-2.4"/><feGaussianBlur stdDeviation="2.25"/><feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/><feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.02 0"/><feBlend mode="normal" in2="shape" result="effect1_innerShadow"/><feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/><feOffset dy="-0.9"/><feGaussianBlur stdDeviation="0.75"/><feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/><feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.08 0"/><feBlend mode="normal" in2="effect1_innerShadow" result="effect2_innerShadow"/></filter><filter id="filter10_i" x="98.4791" y="120.479" width="59.0627" height="59.5399" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/><feOffset dy="0.628254"/><feGaussianBlur stdDeviation="0.250173"/><feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/><feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.4 0"/><feBlend mode="normal" in2="shape" result="effect1_innerShadow"/></filter><filter id="filter11_d" x="116.761" y="139.008" width="22.4739" height="22.4901" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"/><feOffset dy="0.252054"/><feGaussianBlur stdDeviation="0.126027"/><feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.2 0"/><feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow"/><feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/></filter><filter id="filter12_i" x="97.9023" y="119.526" width="60.1939" height="60.5693" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/><feOffset dy="-0.3762"/><feGaussianBlur stdDeviation="0.1881"/><feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/><feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.3 0"/><feBlend mode="normal" in2="shape" result="effect1_innerShadow"/></filter><linearGradient id="paint0_linear" x1="127" y1="26" x2="127" y2="94" gradientUnits="userSpaceOnUse"><stop offset="0.109375" stop-color="#FAC150"/><stop offset="1" stop-color="#D47914"/></linearGradient><linearGradient id="paint1_linear" x1="28" y1="60" x2="28" y2="94" gradientUnits="userSpaceOnUse"><stop stop-color="#F7F7F7"/><stop offset="0.473958" stop-color="#F2EFEC"/><stop offset="1" stop-color="#DFD2C5"/></linearGradient><linearGradient id="paint2_linear" x1="37" y1="80.5" x2="26.5" y2="80.5" gradientUnits="userSpaceOnUse"><stop/><stop offset="1" stop-opacity="0"/></linearGradient><linearGradient id="paint3_linear" x1="130" y1="55" x2="130" y2="94" gradientUnits="userSpaceOnUse"><stop stop-color="#F7F7F7"/><stop offset="0.510417" stop-color="#F3F1F0"/><stop offset="1" stop-color="#D9CEC3"/></linearGradient><linearGradient id="paint4_linear" x1="128" y1="65" x2="128" y2="233.001" gradientUnits="userSpaceOnUse"><stop stop-color="#E89016"/><stop offset="0.479167" stop-color="#FEAB27"/><stop offset="0.895833" stop-color="#FFB947"/><stop offset="0.953125" stop-color="#FFA320"/><stop offset="1" stop-color="#FE9B26"/></linearGradient><linearGradient id="paint5_linear" x1="128" y1="139.029" x2="128" y2="195.04" gradientUnits="userSpaceOnUse"><stop stop-color="white"/><stop offset="1"/></linearGradient><linearGradient id="paint6_linear" x1="124.979" y1="119.903" x2="124.979" y2="145.581" gradientUnits="userSpaceOnUse"><stop stop-color="#FCEB76"/><stop offset="1" stop-color="#FADF5D"/></linearGradient><linearGradient id="paint7_linear" x1="131.028" y1="154.418" x2="131.028" y2="180.096" gradientUnits="userSpaceOnUse"><stop stop-color="#07BFCF"/><stop offset="1" stop-color="#00B3C6"/></linearGradient><linearGradient id="paint8_linear" x1="110.752" y1="127.627" x2="110.752" y2="178.446" gradientUnits="userSpaceOnUse"><stop stop-color="#5284E8"/><stop offset="1" stop-color="#2454D6"/></linearGradient><linearGradient id="paint9_linear" x1="142.893" y1="121.543" x2="142.893" y2="175.486" gradientUnits="userSpaceOnUse"><stop stop-color="#FF7400"/><stop offset="1" stop-color="#FF4000"/></linearGradient><linearGradient id="paint10_linear" x1="113.962" y1="124.514" x2="113.962" y2="139.572" gradientUnits="userSpaceOnUse"><stop stop-color="#F5E46E"/><stop offset="1" stop-color="#EDD753"/></linearGradient><linearGradient id="paint11_linear" x1="110.026" y1="149.645" x2="110.026" y2="178.409" gradientUnits="userSpaceOnUse"><stop stop-color="#275FA9"/><stop offset="1" stop-color="#0C4498"/></linearGradient><linearGradient id="paint12_linear" x1="142.056" y1="160.427" x2="142.056" y2="175.486" gradientUnits="userSpaceOnUse"><stop stop-color="#EA3B00"/><stop offset="1" stop-color="#E82C00"/></linearGradient><linearGradient id="paint13_linear" x1="145.954" y1="121.543" x2="145.954" y2="150.307" gradientUnits="userSpaceOnUse"><stop stop-color="#F46F01"/><stop offset="1" stop-color="#EC5501"/></linearGradient><linearGradient id="paint14_linear" x1="127.999" y1="119.903" x2="127.999" y2="180.096" gradientUnits="userSpaceOnUse"><stop stop-opacity="0"/><stop offset="1"/></linearGradient></defs></svg>'
            }
        }
    }

    get host() {
        const {
            clusterNamespace,
            accountName,
            clusterDomain
        } = this.spec

        return accountName ?
            `${clusterNamespace}.${accountName}.${clusterDomain}` :
            `${clusterNamespace}.${clusterDomain}`
    }

    get systemServerUrl() {
        return `${this.spec.protocol}://${this.host}`
    }

    async provisionSystem() {
        const options = {
            tag: this.spec.tag,
            clusterId: this.spec.clusterId,
            clusterKey: this.spec.clusterKey,
            hubServerURL: this.spec.hubServerURL,
            systemServerURL: this.systemServerUrl,
            host: this.host
        }

        await this.manager.cluster
            .begin(`Provision system server`)
                .upsertFile('../../k8s/clusterrole.yaml')
                .addOwner(this.manager.document)
                .upsertFile('../../k8s/server.yaml', options)
                .patch(this.traxittNamespace, this.traxittNamespacePatch)
            .end()
    }

    async provisionOAuth() {
        await this.manager.cluster
            .begin('Provision CodeZero OAuth')
                .addOwner(this.manager.document)
                .upsertFile('../../k8s/oauth.yaml', { hubServerURL: this.spec.hubServerURL })
            .end()
    }

    async provisionDock() {
        await this.manager.cluster
            .begin('Provision default Dock')
                .addOwner(this.manager.document)
                .upsertFile('../../k8s/dock.yaml')
            .end()
    }

    async provisionApps() {
        const options = {
            tag: this.spec.tag,
            clusterNamespace: this.spec.clusterNamespace,
            clusterDomain: this.spec.clusterDomain,
            hubServerURL: this.spec.hubServerURL,
            systemServerURL: this.systemServerUrl,
            featureAuthKey: this.spec.featureAuthKey,
            stripePublishableKey: this.spec.stripePublishableKey
        }

        await this.manager.cluster
            .begin(`Provision Apps`)
                .addOwner(this.manager.document)
                .upsertFile('../../k8s/marina.yaml', options)
                .upsertFile('../../k8s/store.yaml', options)
                .upsertFile('../../k8s/navstation.yaml', options)
                .upsertFile('../../k8s/harbourmaster.yaml', options)
                .upsertFile('../../k8s/apps.yaml', options)
                .clearOwners()
                .upsertFile('../../k8s/istio.yaml', options)
                .eachFile(async (appDoc) => {
                    // The apps above are not going through the provisioner
                    // TODO: Remove this hack - have them be properly provisioned
                    // at some point perhaps
                    await this.postCreateApp(appDoc)
                }, '../../k8s/apps.yaml', options)
            .end()
    }


    async provisionGateway() {
        await this.manager.status?.push('Provision system gateway')

        const istioProvisioner = await this.manager.getAppProvisioner('istio', 'istio-system')
        const result = await istioProvisioner.createGateway('c6o-system', this.SYSTEM_GATEWAY_NAME, this.gatewayServers)
        if (result.error) throw result.error

        await this.manager.status?.pop()
    }

    async provisionRoutes() {
        const host = this.host.replace(".", "\\.")

        await this.manager.cluster
            .begin(`Provision messaging sub-system`)
                .addOwner(this.manager.document)
                .upsertFile('../../k8s/virtualServices.yaml', { host } )
            .end()
    }

    async provisionMessaging() {
        await this.manager.cluster
            .begin(`Provision messaging sub-system`)
                .addOwner(this.manager.document)
                .upsertFile('../../k8s/publisher.yaml', { tag: this.spec.tag })
                .upsertFile('../../k8s/subscriber.yaml', { tag: this.spec.tag })
            .end()
    }

    async provisionCertificate() {
        // weekly but random minute and hour on Mondays to ensure not to overload hub server
        const schedule = process.env.NODE_ENV === 'development'
            ? '*/5 * * * *' // every 5 minutes on the 5
            : `${Math.floor(Math.random() * 59)} ${Math.floor(Math.random() * 23)} * * 1`

        const options = {
            tag: this.spec.tag,
            accountName: this.spec.accountName,
            hubServerURL: this.spec.hubServerURL,
            clusterId: this.spec.clusterId,
            clusterKey: this.spec.clusterKey,
            backoffLimit: 5,
            schedule
        }

        await this.manager.cluster
            .begin(`Remove possible existing certificate cron jobs to avoid mutations`)
                .deleteFile('../../k8s/ssl-recurring-job.yaml', options)
                .deleteFile('../../k8s/ssl-setup-job.yaml', options)
            .end()

        await this.manager.cluster
            .begin(`Provision certificate cron jobs`)
                .upsertFile('../../k8s/ssl-recurring-job.yaml', options)
                .upsertFile('../../k8s/ssl-setup-job.yaml', options)
            .end()
    }

    async provisionUpdate() {
        // weekly but random minute and hour on Mondays to ensure not to overload hub server
        const schedule = `${Math.floor(Math.random() * 59)} ${Math.floor(Math.random() * 23)} * * 1`

        const options = {
            tag: this.spec.tag,
            hubServerURL: this.spec.hubServerURL,
            clusterId: this.spec.clusterId,
            clusterKey: this.spec.clusterKey,
            backoffLimit: 5,
            schedule
        }

        await this.manager.cluster
            .begin(`Provision update cron job`)
                .upsertFile('../../k8s/update-recurring-job.yaml', options)
            .end()
    }

    async patchCluster() {
        if (!this.newClusterId)
            return
        await this.manager.hubClient.patchCluster(this.newClusterId, { $set: { 'system.status': 'completed' } })
    }
}
