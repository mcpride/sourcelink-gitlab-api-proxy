# SourceLink.Gitlab api proxy

A proxy for Gitlab private repositories to make them compatible with SourceLink's source indexing by allowing the usage of personal access tokens.

This node.js express application acts as a proxy, receiving raw file requests and proxiing the request to the Gitlab v4 api. It should at localhost.

The target Gitlab instance URL is specified by setting the environment variable `GITLAB_URL`. Also the environment variable `GITLAB_PRIVATE_TOKEN` has to be set before runing the server. It is a Gitlab [Personal Access Token](https://docs.gitlab.com/ee/user/profile/personal_access_tokens.html) which **must have `read_repository` permissions **.

As an example, if the proxy listens to localhost:6219 and the target Gitlab instance URL is `gitlab.com` and the private token for gitlab is `23n4b3kr34kjr34r`, then the request url (added from SourceLink.Gitlab to the PDBs):

```
http://localhost:6219/${project_groups_and_name}/raw/${commit_hash}/${file_path_and_name}
```

Is proxied to:

```
https://gitlab.com/api/v4/projects/${project_groups_and_name}/repository/files/{file_path_and_name}/raw?ref=${commit_hash}&private_token=23n4b3kr34kjr34r
```

Where the parameters:

* `project_groups_and_name` : Is the combination of project group and repository name. All forward slash separators will be replaced by a percent encoded forward slash, e.g. `group%2Freponame`.

* `commit_hash` : Is the **full** commit hash of the requested target file version.

* `file_path_and_name` : Is the relative directory and the target file name - relative to the repository root. All forward slash separators will be replaced by a percent encoded forward slash, e.g. `directory1%2subdirectory2%2filename3.cs`.

## Run with Node

```bash
npm install
export GITLAB_URL="https://gitlab.com.com"
export GITLAB_PRIVATE_TOKEN="23n4b3kr34kjr34r"
export GITLAB_PROXY_PORT="6219"
node sourcelink-gitlab-api-proxy.js
```