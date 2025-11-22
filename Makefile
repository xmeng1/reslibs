# Env Setup
ci-pem:
	chmod 400 ci/*.pem


# ssh-copy-id -i ./ci/jetbrain_access.pem claude@45.78.37.217
# N...C...2...
bwg-claude-ssh:
	ssh -i ./ci/jetbrain_access.pem claude@45.78.37.217
