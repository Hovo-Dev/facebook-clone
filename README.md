# Facebook Clone

### A brief description of your project, highlighting its purpose and key features.

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)

## Introduction

#### Our project is a streamlined Facebook clone designed to emulate key social networking functionalities, including user profiles, friend requests, and dynamic news feeds. Built with a non-ORM backend, it offers developers direct control over database interactions, enhancing performance and customization capabilities.

## Features

- **Non-ORM Database Integration**:
    - By interacting directly with the PostgreSQL database without relying on an Object-Relational Mapping (ORM) tool, we achieve greater control over SQL queries, leading to optimized performance and a deeper understanding of database operations
- **Dynamic Query Builder**:
    - We have implemented a custom dynamic query builder that constructs complex and flexible SQL queries at runtime. This feature allows for dynamic filtering, sorting, and pagination, enhancing the application's data retrieval capabilities.
- **User Authentication**:
    - Our application incorporates secure user authentication mechanisms, including token-based authentication using JSON Web Tokens (JWT). This ensures that only authorized users can access specific resources within the application.
- **Comprehensive Validation**:
    - We rigorously validate input data to ensure data integrity and prevent potential security vulnerabilities arising from malformed input. This is achieved through the use of robust validation libraries.
- **Modular Architecture**:
    - The codebase is organized into distinct modules, promoting scalability and maintainability. This modular structure allows for easy integration of new features and facilitates collaborative development.

## Installation

1. **Install the dependencies**:
    ```bash
      $ yarn
    ```
   
2. **Migration**:
    ```bash
      $ yarn migrate
    ```

3. **Create a `.env` file**:
    ```bash
      $ cp .env.example .env
    ```
   
4. **Start the application**:
    ```bash
      $ yarn start:dev
    ```
 
5. **Access the application**:
    ```bash
      $ open http://localhost:3000/docs
    ```
