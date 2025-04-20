push:
	git add .
	@read -p "Commit message: " message; \
	git commit -m "$$message"
	git push
	@echo "\033[92m -- PUSHED -- \033[0m"

deploy:
	git checkout production
	git merge development --no-edit
	git push
	git checkout development
	@echo "\033[92m -- DEPLOYED -- \033[0m"
