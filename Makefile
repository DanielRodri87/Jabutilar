# Executa o ambiente como se fosse produção (usa apenas o docker-compose.yml padrão)
run:
	docker-compose up --build

# Executa em modo desenvolvimento (combina o arquivo padrão com o arquivo .dev.yml)
# As alterações no código (backend ou frontend) serão refletidas imediatamente
run_dev:
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build

# Sobe apenas o container do frontend
run_front:
	docker-compose up frontend

# Sobe apenas o container do backend
run_back:
	docker-compose up backend

# Comando utilitário para derrubar tudo e limpar containers
down:
	docker-compose down