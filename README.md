# Sistema de Gerenciamento de Hotel

Este projeto foi desenvolvido para atender às necessidades de um hotel com 30 quartos. Em breve, será adaptado para suportar uma quantidade variável de quartos.

## Como Instalar o Projeto

Siga os passos abaixo para configurar e rodar o projeto localmente:

1. **Clonar o Projeto:**
   ```bash
   git clone https://github.com/seu-usuario/seu-repositorio.git
Instalar o Node.js:

Certifique-se de ter o Node.js instalado. Você pode baixá-lo aqui.

Instalar Dependências:

Acesse a pasta hotel-frontend e instale as dependências:

bash
Copy
cd hotel-frontend
npm install
Repita o processo para a pasta hotel-backend:

bash
Copy
cd ../hotel-backend
npm install
Configurar Conexão com o Banco de Dados
Instalar MySQL:

Certifique-se de ter o MySQL instalado. Você pode baixá-lo aqui.

Criar o Banco de Dados:

Execute o script SQL abaixo para criar o banco de dados e as tabelas necessárias:

-- Criação do banco de dados
CREATE DATABASE IF NOT EXISTS hotel_control;
USE hotel_control;

-- Tabela de Hóspedes
CREATE TABLE IF NOT EXISTS `guests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `cpf_cnpj` varchar(20) NOT NULL,
  `estado` varchar(20) DEFAULT NULL,
  `cidade` varchar(50) DEFAULT NULL,
  `bairro` varchar(50) DEFAULT NULL,
  `rua` varchar(100) DEFAULT NULL,
  `numero` varchar(20) DEFAULT NULL,
  `cep` varchar(20) DEFAULT NULL,
  `nome_fantasia` varchar(100) DEFAULT NULL,
  `type` varchar(10) NOT NULL,
  `telefone` varchar(15) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Tabela de Quartos
CREATE TABLE IF NOT EXISTS `rooms` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `preco` int NOT NULL,
  `location` varchar(50) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Tabela de Reservas
CREATE TABLE IF NOT EXISTS `reservations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `room_id` int NOT NULL,
  `guest_id` int NOT NULL,
  `custom_name` varchar(50) DEFAULT NULL,
  `start_date` datetime NOT NULL,
  `end_date` datetime NOT NULL,
  `daily_rate` decimal(10,2) NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `amount_paid` decimal(10,2) NOT NULL DEFAULT '0.00',
  `start_time` time NOT NULL DEFAULT '12:00:00',
  `end_time` time NOT NULL DEFAULT '12:00:00',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_reservation` (`room_id`,`start_date`,`end_date`),
  KEY `room_id` (`room_id`),
  KEY `guest_id` (`guest_id`),
  CONSTRAINT `reservations_ibfk_1` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`),
  CONSTRAINT `reservations_ibfk_2` FOREIGN KEY (`guest_id`) REFERENCES `guests` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

Configurar Conexão:

Acesse a pasta db dentro de hotel-backend.

Edite o arquivo connection.js com os dados de conexão do seu banco de dados.

Como Rodar o Projeto
Iniciar o Frontend:

Acesse a pasta hotel-frontend e execute:

bash
Copy
npm start
Iniciar o Backend:

Acesse a pasta hotel-backend e execute:

bash
Copy
npm start
Script para Criar o Banco de Dados
O script SQL fornecido acima já está configurado para criar o banco de dados e as tabelas necessárias. Certifique-se de executá-lo apenas uma vez para evitar erros de duplicação.

Contribuição
