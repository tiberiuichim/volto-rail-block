SHELL=/bin/bash

DIR=$(shell basename $$(pwd))
ADDON ?= volto-rail-block

# We like colors
# From: https://coderwall.com/p/izxssa/colored-makefile-for-golang-projects
RED=`tput setaf 1`
GREEN=`tput setaf 2`
RESET=`tput sgr0`
YELLOW=`tput setaf 3`

.PHONY: build-frontend
build-frontend:		## Creates a Volto Project for development
	npm install -g yo
	npm install -g @plone/generator-volto
	npm install -g mrs-developer
	yo @plone/volto project --addon ${ADDON} --workspace "src/addons/${DIR}" --no-interactive
	ln -sf $$(pwd) project/src/addons/
	cp .project.eslintrc.js .eslintrc.js
	cd project && yarn
	@echo "-------------------"
	@echo "Project is ready!"
	@echo "Now run: cd project && yarn start"

.PHONY: build-backend
build-backend:  ## Build Plone 5.2
	(cd api && python3 -m venv .)
	(cd api && bin/pip install --upgrade pip)
	(cd api && bin/pip install --upgrade wheel)
	(cd api && bin/pip install -r requirements.txt)
	(cd api && bin/buildout)

.PHONY: build
build:
	make build-backend
	make build-frontend

all: build

.PHONY: start-backend
start-backend: ## Start Plone Backend
	@echo "$(GREEN)==> Start Plone Backend$(RESET)"
	(cd api && PYTHONWARNINGS=ignore bin/instance fg)

.PHONY: start-test-backend
start-test-backend: ## Start Test Plone Backend
	@echo "$(GREEN)==> Start Test Plone Backend$(RESET)"
	ZSERVER_PORT=55001 CONFIGURE_PACKAGES=plone.app.contenttypes,plone.restapi,kitconcept.volto,kitconcept.volto.cors,eea.volto.slate APPLY_PROFILES=plone.app.contenttypes:plone-content,plone.restapi:default,kitconcept.volto:default-homepage,eea.volto.slate:default ./api/bin/robot-server plone.app.robotframework.testing.PLONE_ROBOT_TESTING

.PHONY: start-docker-backend
start-docker-backend:
	@echo "$(GREEN)==> Start Plone Backend$(RESET)"
	docker pull plone
	docker run -it --rm -e SITE="Plone" -e ADDONS="eea.schema.slate" -e VERSIONS="plone.schema=1.3.0 plone.restapi=8.9.1" -e PROFILES="profile-plone.restapi:blocks" -p 8080:8080 plone fg

.PHONY: help
help:		## Show this help.
	@echo -e "$$(grep -hE '^\S+:.*##' $(MAKEFILE_LIST) | sed -e 's/:.*##\s*/:/' -e 's/^\(.\+\):\(.*\)/\\x1b[36m\1\\x1b[m:\2/' | column -c2 -t -s :)"

.PHONY: test
test:
	docker pull plone/volto-addon-ci
	docker run -it --rm -e GIT_NAME=volto-slate -e RAZZLE_JEST_CONFIG=jest-addon.config.js -v "$$(pwd):/opt/frontend/my-volto-project/src/addons/volto-slate" plone/volto-addon-ci yarn test --watchAll=false

.PHONY: test-update
test-update:
	docker pull plone/volto-addon-ci
	docker run -it --rm -e GIT_NAME=volto-slate -e RAZZLE_JEST_CONFIG=jest-addon.config.js -v "$$(pwd):/opt/frontend/my-volto-project/src/addons/volto-slate" plone/volto-addon-ci yarn test --watchAll=false -u

.PHONY: test-acceptance-server
test-acceptance-server: ## Run test acceptance server
	docker run -i --rm --name=plone -e ZSERVER_HOST=0.0.0.0 -e ZSERVER_PORT=55001 -p 55001:55001 -e SITE=plone -e APPLY_PROFILES=plone.app.contenttypes:plone-content,plone.restapi:default,kitconcept.volto:default-homepage -e CONFIGURE_PACKAGES=plone.app.contenttypes,plone.restapi,kitconcept.volto,kitconcept.volto.cors -e ADDONS='plone.app.robotframework plone.app.contenttypes plone.restapi kitconcept.volto' plone ./bin/robot-server plone.app.robotframework.testing.PLONE_ROBOT_TESTING
