<div align="center"><img style = "width:100%;"src="https://i.imgur.com/JLVAZoH.png"></img></div>
<hr>
<h2 align=center>BoardCamp (Back-End)</h2>
<h3 align=center>Web development Project</h3>
<hr>
<h4 align=center>A api for a webapp that manages board game rentals</h4>
<h4 align=center>First project using PostgreSQL</h4>
<h4 align=center>Check the <a href="https://github.com/bootcamp-ra/boardcamp-front">Front-end</a></h4>
<hr>

## Features

- Categories CRUD [Create|Read]
- Games CRUD [Create|Read]
- Customers CRUD [Create|Read|Update]
- Rental CRUD [Create|Read|Update|Delete]


## Requirements

- Categories CRUD [Create|Read]
    - Format of a category (`categories` table)
        
        ```jsx
        {
          id: 1,
          name: 'Strategy',
        }
        ```
        
    - List categories
        - Route: **GET** `/categories`
        - **Response**: list of all categories each in the above format:
            
            ```jsx
            [
              {
                id: 1,
                name: 'Strategy',
              },
              {
                id: 2,
                name: 'Investigation',
              }
            ]
            ```
            
    - Insert category
        - **Route:** **POST** `/categories`
        - **Request:** *body* in format
            
            ```jsx
            {
              name: 'Investigation'
            }
            ```
            
        - **Response**: status 201, no data
        - **Business rules**
            - `name` cannot be empty ⇒ in this case it should return **status 400**
            - `name` cannot be an existing category name ⇒ in which case it should return **status 409**
- Games CRUD [Create|Read]
    - Format of a game (`games` table)
        
        ```jsx
        {
          id: 1,
          name: 'Real Estate Bank',
          image: 'http://',
          stockTotal: 3,
          categoryId: 1,
          pricePerDay: 1500,
        }
        ```
        
    - List games
        - **Route**: **GET** `/games`
        - **Response:** list of games found, following the format below (including category name as highlighted)
            
            ```jsx
            [
              {
                id: 1,
                name: 'Real Estate Bank',
                image: 'http://',
                stockTotal: 3,
                categoryId: 1,
                pricePerDay: 1500,
                categoryName: 'Strategy'
              },
              {
                id: 2,
                name: 'Detective',
                image: 'http://',
                stockTotal: 1,
                categoryId: 2,
                pricePerDay: 2500,
                categoryName: 'Investigation'
              },
            ]
            ```
            
        - **Business rules**
            - If a `name` parameter is passed in the **query string** of the request, the games must be filtered to return only those that start with the passed string (*case insensitive*). Example:
                - For the `/games?name=ba` route, an array must be returned only with games that start with "ba", such as "Banco Imobiliário", "Batalha Naval", etc.
    - Insert a game
        - **Route**: **POST** `/games`
        - **Request**: *body* in the format:
            
            ```jsx
            {
              name: 'Real Estate Bank',
              image: 'http://',
              stockTotal: 3,
              categoryId: 1,
              pricePerDay: 1500,
            }
            ```
            
        - **Response:** status 201, no data
        - **Business rules**
            - `name` cannot be empty; `stockTotal` and `pricePerDay` must be greater than 0; `categoryId` must be an existing category id; ⇒ in these cases it should return **status 400**
            - `name` cannot be an existing game name ⇒ in which case it should return **status 409**
- Client CRUD [Create|Read|Update]
    - Format of a customer (`customers` table)
        
        ```jsx
        {
          id: 1,
          name: 'João Alfredo',
          phone: '21998899222',
          cpf: '01234567890',
          birthday: '1992-10-05'
        }
        ```
        
    - List customers
        - **Route: GET** `/customers`
        - **Response:** list with all customers
            
            ```jsx
            [
              {
                id: 1,
                name: 'João Alfredo',
                phone: '21998899222',
                cpf: '01234567890',
                birthday: '1992-10-05'
              },
              {
                id: 2,
                name: 'Maria Alfreda',
                phone: '21998899221',
                cpf: '12345678910',
                birthday: '1994-12-25'
              },
            ]
            ```
            
        - **Business rules**
            - If a `cpf` parameter is passed in the **query string** of the request, the clients must be filtered to return only those with CPF that begin with the passed string. Example:
                - For the `/customers?cpf=012` route, an array must be returned only with customers whose CPF starts with "012", such as "01234567890", "01221001200", etc.
    - Search for a customer by id
        - **Route: GET** `/customers/:id`
        - **Response:** only the user object with the id passed:
            
            ```sql
            {
              id: 1,
              name: 'João Alfredo',
              phone: '21998899222',
              cpf: '01234567890',

## Usage

Install my project with npm

> Clone the repository:

```bash
  git clone git@github.com:DanielCdOliveira/projeto15-boardcamp.git
```
>Install dependences:

```bash
  npm install
```

> Create a .env file like the .env.example file

> Run aplication:

```bash
  npm run dev
```

### Built with

![Node](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Javascript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Visual Studio Code](https://img.shields.io/badge/Visual%20Studio%20Code-0078d7.svg?style=for-the-badge&logo=visual-studio-code&logoColor=white)
![Git](https://img.shields.io/badge/git-%23F05033.svg?style=for-the-badge&logo=git&logoColor=white)

### Contact

[![LinkedIn][linkedin-shield]][linkedin-url]

[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=blue
[linkedin-url]: https://www.linkedin.com/in/danielcdoliveira/
