# Sistema de Gerenciamento de Quartos

Este projeto foi desenvolvido para atender às necessidades de um hotel com 30 quartos. Em breve, será adaptado para suportar uma quantidade variável de quartos.

## Como Instalar o Projeto

Siga os passos abaixo para configurar e rodar o projeto localmente:

1. **Clonar o Projeto:**
   ```bash
   https://github.com/DanielRossano/Hotel_react.git
   
2. **Instalar o Node.js:**
   Certifique-se de ter o Node.js instalado. Download [aqui](https://nodejs.org/).

3. **Instalar Dependências:**
   1. Acesse a pasta `hotel-frontend` e instale as dependências:
   ```bash
   cd hotel-frontend
   npm install
    ```

   2. Repita o processo para a pasta `hotel-fronbackend`:
      ```bash
      cd hotel-backend
      npm install 
  
## Configurar Conexão com o Banco de Dados

### Instalar MySQL

Certifique-se de ter o MySQL instalado. Download [aqui](https://dev.mysql.com/downloads/installer/).

### Criar o Banco de Dados

Execute o script SQL abaixo para criar o banco de dados e as tabelas necessárias:
   ```sql
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

   INSERT INTO `rooms` VALUES
      (1, 'Quarto 1',  100, '1'),  (2, 'Quarto 2',  100, '1'),  (3, 'Quarto 3',  100, '1'),
      (4, 'Quarto 4',  100, '1'),  (5, 'Quarto 5',  100, '1'),  (6, 'Quarto 6',  100, '1'),
      (7, 'Quarto 7',  100, '1'),  (8, 'Quarto 8',  100, '1'),  (9, 'Quarto 9',  100, '1'),
      (10, 'Quarto 10', 100, '1'), (11, 'Quarto 11', 100, '1'), (12, 'Quarto 12', 100, '1'),
      (13, 'Quarto 13', 100, '1'), (14, 'Quarto 14', 100, '1'), (15, 'Quarto 15', 100, '1'),
      (16, 'Quarto 16', 150, '2'), (17, 'Quarto 17', 150, '2'), (18, 'Quarto 18', 150, '2'),
      (19, 'Quarto 19', 150, '2'), (20, 'Quarto 20', 150, '2'), (21, 'Quarto 21', 150, '2'),
      (22, 'Quarto 22', 150, '2'), (23, 'Quarto 23', 150, '2'), (24, 'Quarto 24', 150, '2'),
      (25, 'Quarto 25', 150, '2'), (26, 'Quarto 26', 150, '2'), (27, 'Quarto 27', 150, '2'),
      (28, 'Quarto 28', 150, '2'), (29, 'Quarto 29', 150, '2'), (30, 'Quarto 30', 150, '2');
   ```

## Configurar Conexão

1. Acesse a pasta `db` dentro de `hotel-backend`(hotel_react/hotel-backend/db):

2. Edite o arquivo `connection.js` com os dados de conexão do seu banco de dados.

## Como Rodar o Projeto

### Iniciar o Frontend e o Backend

1. **Frontend:**
   - Acesse a pasta `hotel-frontend` e execute o seguinte comando:
     ```bash
     npm start
     ```
   - O frontend estará disponível em:  
     🔗 **http://localhost:3000/**

2. **Backend:**
   - Acesse a pasta `hotel-backend` e execute o seguinte comando:
     ```bash
     npm start
     ```
---

#### ⚠️ Importante:
Para que o sistema funcione corretamente, **ambos os terminais (frontend e backend)** devem estar rodando simultaneamente. Certifique-se de manter os dois processos ativos.


