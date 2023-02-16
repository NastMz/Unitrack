# Unitrack
## Proyecto para el curso Sistemas Distribuidos - Universidad de los llanos

Este proyecto consiste de un backend en Flask que utiliza microservicios para brindar información sobre los horarios de los paraderos de autobuses, y un frontend en React para la interfaz de usuario. La aplicación cuenta con tres endpoints diferentes que brindan información sobre los paraderos de autobuses de forma separada.

## Tabla de Contenido

- [Timetable Service: Ver horarios de paraderos](#timetable-service-ver-horarios-de-paraderos)
- [Stop-Timetable Service: Ver ID de paraderos a cierta hora](#stop-timetable-service-ver-id-de-paraderos-a-cierta-hora)
- [Stop Service: Ver información completa de paraderos](#stop-service-ver-información-completa-de-paraderos)
- [Iniciando los proyectos](#iniciando-los-proyectos)
    - [Ejecución individual](#ejecución-individual)
        - [Ejecución del backend](#ejecución-del-backend)
        - [Ejecución del frontend](#ejecución-del-frontend)
    - [Ejecución con docker compose](#ejecución-con-docker-compose)


## Timetable Service: Ver horarios de paraderos
Este servcio permite obtener los horarios de los paraderos de autobuses. Para utilizarlo se debe enviar una solicitud GET a la URL correspondiente y la aplicación responderá con una lista de todos los horarios disponibles para los paraderos.

## Stop-Timetable Service: Ver ID de paraderos a cierta hora
Este servicio permite a los usuarios ver los ID de los paraderos que están programados para llegar a una hora específica. Para utilizarlo se debe enviar una solicitud GET a la URL correspondiente, incluyendo el ID de la hora para la cual desean ver los ID de los paraderos. La aplicación responderá con una lista de los ID de los paraderos que están programados para llegar a esa hora. `<URL>/<ID_HORA>`

## Stop Service: Ver información completa de paraderos
Este servicio permite a los usuarios ver la información completa de una lista de paraderos, incluyendo su ID, nombre, descripción, imagen y ubicación. Para utilizarlo se debe enviar una solicitud POST a la URL correspondiente, incluyendo una lista de los ID de los paraderos que desean ver. La aplicación responderá con la información completa de los paraderos correspondientes.

```
{
  "stops": [1, 2, 3, ...]
}
```

## Iniciando los Proyectos

Para iniciar los proyectos en este repositorio, deberá tener `Python` y `Node` instalados en su máquina si desea [ejecutarlos manualmente](#ejecución-individual) o puede usar el archivo `docker-compose.yml` incluido y [ejecutarlo directamente](#ejecución-con-docker-compose) sin necesidad de instalar nada.

### Ejecución individual

Para ejecutar manualmente los proyectos, debes crear la base de datos en `PostgreSQL` (se incluyen los scripts en el repositorio).

#### Ejecución del backend

Primero deberá instalar las dependencias para cada proyecto ejecutando `pip install -r requirements.txt` en el directorio raíz de cada proyecto. 

Además debe crear un archivo `.env` con las variables que estan en `.env.example` para cada uno.

Para iniciar cualquier proyecto, navegue hasta el directorio del mismo y ejecute el siguiente comando:

```markdown
> cd <DIRECTORIO_PROYECTO>
> python run.py
```

*Recuerde que cada servicio esta configurado para correr sobre el puerto `8000` en local, por lo que debera editar el archivo `run.py` para usar los puertos que desee.

#### Ejecución del frontend

Primero deberá instalar las dependencias del proyecto ejecutando `npm install` en el directorio raíz del proyecto frontend.

Además debe crear un archivo `.env` con las variables que estan en `.env.example`.

Para iniciar el proyecto frontend, vaya al directorio del frontend y ejecute el siguiente comando:

```markdown
> cd <DIRECTORIO_FRONTEND>
> npm run dev
```

Esto iniciará el servidor de desarrollo para el proyecto frontend, y puede ver la aplicación en su navegador web en `http://localhost:3000`.

### Ejecución con docker compose

Debe tener instalado `Docker` y `docker compose` en su máquina.

Navegue hasta el directorio del repositorio y ejecute este comando:

```markdown
> cd <DIRECTORIO_REPOSITORIO>
> docker-compose up --build
```

Esto iniciará todos los proyectos inlcuida la base de datos.