start:
	@docker compose up -d --build --remove-orphans --quiet-pull

stop:
	@docker compose stop
