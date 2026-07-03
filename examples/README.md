# Workflow Examples

This directory contains example workflow definitions that demonstrate the DVRE
Workflow Composer's capabilities. Each example is a self-contained JSON file
that can be imported into the composer or submitted directly to the scheduler.

---

## 1. Direct Infrastructure (`direct.json`)

### General Description

A two-stage pipeline that writes data to a shared volume and then reverses it.
Infrastructure (the Kubernetes cluster) is specified directly by endpoint URL,
without consulting the on-chain asset registry. The workflow consists of:

- **Section "write"**: runs a hello-world task that writes output to a
  1 GiB persistent volume (`data-vol`) mounted at `/data`.
- **Section "reverse"**: depends on "write", runs a reverse task that reads
  the volume content and writes the reversed version back.

### Assumptions

- A Kubernetes cluster is reachable at `http://localhost:8080` (the DVRE
  workflow operator).
- The `local-path` storage class is available on the cluster (default on k3s).
- The container images
  `thomasschilder/dvre-test-workflow-task-hello-world` and
  `thomasschilder/dvre-test-workflow-task-reverse` are publicly pullable.
- No on-chain asset registration is required — the operator endpoint is
  known at authoring time.

### Relevancy

This is the simplest deployment scenario. It is useful for:

- Local development and testing of the scheduler/operator stack.
- Environments where the cluster endpoint is static and known.
- Validating the core workflow lifecycle (DAG resolution, tier deployment,
  volume provisioning, task sequencing) without blockchain dependencies.

---

## 2. Infrastructure as an On-Chain Asset (`infrastructure-as-asset.json`)

### General Description

The same two-stage write → reverse pipeline as the direct example, but the
Kubernetes cluster is referenced as an on-chain asset registered in the
AssetV1 smart contract. The workflow specifies `source: asset` with
`assetId: 2`, and the scheduler resolves the cluster endpoint, type, and
metadata from the asset indexer at deployment time.

### Assumptions

- The asset indexer is running and has indexed asset ID 2 (a cluster-type
  asset, `asset_type: 4`) from the AssetV1 contract on the Besu network.
- The scheduler's `ASSET_INDEXER_URL` environment variable points to the
  asset indexer API.
- The resolved asset's `url` field contains the operator endpoint
  (e.g. `http://localhost:8082`).
- The `local-path` storage class and the same container images as the
  direct example are available on the target cluster.
- The asset owner has authorized the user to deploy to the cluster
  (via on-chain access control or policy contract).

### Relevancy

This example demonstrates the DVRE's blockchain-integrated deployment model:

- Infrastructure is treated as a on-chain asset, testing the sharing and resolving assets via smart contracts.
- Cluster endpoints are resolved dynamically at deploy time, decoupling workflow authoring from infrastructure specifics.
- The asset's `policyAddress` can enforce role-based access (e.g. `ResearcherPolicy`) — the operator verifies on-chain authorization before creating pods.
- Forms the foundation for multi-cluster, multi-provider workflows where infrastructure is discovered rather than hardcoded.
