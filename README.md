# LAUTARO-DIESEL-ECOMMERCE
Proyecto de Ecommerce (Trabajo Final Integrador UTN FRC) - Gestión de usuarios e ítems, compras con carrito, integración Mercado Pago, descuentos personalizados y carga masiva con n8n.

# 🚀 Ecommerce Lautaro Diesel

**Trabajo Final Integrador – Tecnicatura Universitaria en Programación (UTN FRC)**  

---

## 🎯 Objetivo del Proyecto
Desarrollar una aplicación web de gestión y ventas que permita:

- 🔑 **Login y roles de usuario** (admin, cliente, bombista, particular).  
- 🛠️ **CRUD completo** de usuarios e ítems.  
- 🛒 **Carrito de compras** con validación de stock.  
- 💳 **Integración con Mercado Pago** para pagos online seguros.  
- 🎁 **Descuentos personalizados** según segmento de cliente.  
- 📂 **Carga masiva de productos** mediante flujos automatizados con **n8n**.  

---

## 🛠️ Tecnologías Utilizadas
- **Backend:** Java + Spring Boot (Spring Cloud, Eureka, JPA/Hibernate, JWT)  
- **Frontend:** Angular + Bootstrap (diseño responsive y dinámico)  
- **Base de Datos:** SQL Server  
- **APIs:** Mercado Pago, API REST propia  
- **Testing:** JUnit, Postman  
- **Otros:** Docker, GitHub/GitLab, n8n  

---


---

## 🔍 Mejoras respecto a [lautarodiesel.com.ar](https://lautarodiesel.com.ar)

La web actual es **informativa y estática**, sin funcionalidades de e-commerce.  
Nuestro proyecto propone las siguientes **mejoras claves**:

- ✅ **Catálogo dinámico:** productos con fotos, descripciones, stock real y precios actualizados.  
- ✅ **Carrito de compras real:** checkout online con Mercado Pago.  
- ✅ **Gestión de usuarios y roles:** administración de clientes, descuentos por segmento.  
- ✅ **Panel administrativo:** CRUD de ítems y usuarios, reportes de ventas y stock.  
- ✅ **Carga automatizada:** integración con **Excel + n8n** para importar productos.  
- ✅ **Diseño moderno:** interfaz responsiva con Angular, mejor experiencia de usuario.  
- ✅ **SEO y performance:** URLs limpias, recursos optimizados y meta tags para buscadores.  

---
## 📦 Dependencias del proyecto

Este proyecto está construido con **Spring Boot 3** y utiliza las siguientes dependencias:

- [![Spring Web](https://img.shields.io/badge/Spring%20Web-3.3.4-brightgreen)](https://docs.spring.io/spring-boot/docs/current/reference/html/web.html)  
  Exposición de controladores REST y manejo de JSON.

- [![Spring Security](https://img.shields.io/badge/Spring%20Security-6.x-brightgreen)](https://docs.spring.io/spring-security/reference/index.html)  
  Autenticación y autorización de usuarios.

- [![JJWT](https://img.shields.io/badge/JJWT-0.11.5-orange)](https://github.com/jwtk/jjwt)  
  Generación y validación de tokens JWT para seguridad basada en tokens.

- [![Spring Data JPA](https://img.shields.io/badge/Spring%20Data%20JPA-3.x-brightgreen)](https://spring.io/projects/spring-data-jpa)  
  Abstracción de persistencia con entidades y repositorios.

- [![SQL Server Driver](https://img.shields.io/badge/SQL%20Server%20JDBC-latest-blue)](https://learn.microsoft.com/sql/connect/jdbc/download-microsoft-jdbc-driver-for-sql-server)  
  Conexión de la aplicación a la base de datos **SQL Server**.

- [![Validation](https://img.shields.io/badge/Spring%20Validation-3.x-brightgreen)](https://docs.spring.io/spring-framework/reference/core/validation/beanvalidation.html)  
  Validación de datos de entrada con anotaciones (`@NotNull`, `@Email`, etc.).

- [![Spring Mail](https://img.shields.io/badge/Spring%20Mail-3.x-brightgreen)](https://docs.spring.io/spring-boot/docs/current/reference/html/io.html#io.email)  
  Envío de correos electrónicos (ejemplo: recuperación de contraseña).

- [![Lombok](https://img.shields.io/badge/Lombok-1.18.32-yellow)](https://projectlombok.org/)  
  Reducción de boilerplate con anotaciones (`@Getter`, `@Setter`, `@Builder`, etc.).




## 👨‍💻 Autores
- **Breppe Ronzini Tomás Ezequiel** – Legajo 113912  
- **Artusa Manuel** – Legajo 114393  

