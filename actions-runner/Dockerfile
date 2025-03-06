# Define base image
FROM ubuntu:latest

# Update system and install necessary packages
RUN apt-get update && \
    apt-get install -y curl git perl && \
    rm -rf /var/lib/apt/lists/*

# Define environment variable
ARG UID=1000
ARG GID=1000
ENV RUNNER_USER="runner"
ENV RUNNER_VERSION="2.308.0"
ENV RUNNER_WORKDIR="/actions-runner"

# Create a directory for the runner and a new user
RUN mkdir -p ${RUNNER_WORKDIR} && \
    groupadd -g ${GID} ${RUNNER_USER} && \
    useradd -m -u ${UID} -g ${GID} ${RUNNER_USER} && \
    chown -R ${RUNNER_USER}:${RUNNER_USER} ${RUNNER_WORKDIR}

# Switch to the new user
USER ${RUNNER_USER}

# Download the runner
WORKDIR ${RUNNER_WORKDIR}
RUN curl -o actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz -L https://github.com/actions/runner/releases/download/v${RUNNER_VERSION}/actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz

# Verify the hash
RUN echo "9f994158d49c5af39f57a65bf1438cbae4968aec1e4fec132dd7992ad57c74fa  actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz" | shasum -a 256 -c

# Extract the installer
RUN tar xzf ./actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz

# Install dependencies
USER root
RUN ./bin/installdependencies.sh
USER ${RUNNER_USER}

# Run the configuration script
ENV RUNNER_NAME="openavatar-runner-1"
ENV RUNNER_URL="https://github.com/OpenAvatarNFT"
ENV RUNNER_TOKEN="AA224VLKI7HTVV5M4JUH6B3E3UULE"
RUN ./config.sh --url ${RUNNER_URL} --token ${RUNNER_TOKEN} --name ${RUNNER_NAME} --replace --unattended

# Start the runner when the container is run
CMD ["./run.sh"]
