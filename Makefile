# Env Setup
ci-pem:
	chmod 400 ci/*.pem


# ssh-copy-id -i ./ci/jetbrain_access.pem claude@45.78.37.217
# N...C...2...
bwg-claude-ssh:
	ssh -i ./ci/jetbrain_access.pem claude@45.78.37.217


# AI 工具

zcf:
	npx zcf

# OpenSpec
# openspec init
#▌ Universal AGENTS.md (always available)
#▌ Antigravity
#▌ Claude Code
#▌ Codex
#▌ Gemini CLI
#▌ OpenSpec structure created
#▌ AI tools configured
.PHONY: openspec
openspec-list:
	openspec list
