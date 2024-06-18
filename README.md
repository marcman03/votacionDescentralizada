Este proyecto esta hecho con: nodejs +express--> para el backend vuejs --> pare el front

Para ejecutar el projecto tienes que completar el fichero con la base de datos correspondiente /backend/db.js

I en backend hacer node app.js
I en frontend hacer npm run build








Enunciado:

La idea principal es desarrollar una aplicación para organizar votaciones descentralizadas para comunidades basada en tecnología blockchain, con el objetivo principal de facilitar la toma de decisiones democráticas y transparentes dentro de las comunidades, sin necesidad de una entidad central que verifique la votación.

Gestión de Comunidades:

La comunidad tendrá un nombre, una breve descripción, la fecha de creación y se le incluirá un número identificador autoincremental. Estas comunidades servirán como entornos donde los miembros pueden participar en votaciones. La comunidad tendrá usuarios i una cadena de bloques.

Gestión de Usuarios:

Los usuarios podrán registrarse como miembros o administradores. Para registrarse, proporcionarán la siguiente información: fecha de nacimiento, correo electrónico, número de teléfono, contraseña  y un nombre que les identifica.

Los usuarios pertenecen a una o más de una comunidad.

Gestión de Miembros:

Los miembros de una comunidad podrán participar en las votaciones. Cada miembro estará asociado con una o más de una comunidad. En los miembros también guardaremos el nivel de participación en las votaciones que será un porcentaje de 0 al 100.

Gestión de Administradores:

Los administradores serán usuarios con privilegios especiales para gestionar las comunidades. Será quien crea las votaciones y quien crea las actas. Cada comunidad tendrá mínimo un administrador.

Gestión de Votaciones y Contrato Inteligente:

Para cada votación que se organice, se desplegará un contrato inteligente único en la cadena de bloques, la cadena de bloques tiene que ser de la comunidad del creador. Este contrato inteligente contendrá las reglas específicas de la votación, quién puede votar, la duración de la votación . Además, cada votación tendrá una descripción que explique el propósito de la votación y qué se llevará a cabo en caso de la opción que se escoja.

Cada votación tendrá múltiples opciones que tendrán una pequeña descripción y serán identificadas por un nombre.

Las reglas tendrán un nombre que les identifique, y una descripción que explique la regla.

Una vez que finalice la votación, el contrato inteligente calculará automáticamente los resultados en función de los votos registrados y los hará públicos para que todos los miembros de la comunidad puedan verificarlos, para esto tendrá que guardar los votos de los miembros.
La votación será identificado por un identificador autoincremental.

Gestión de Actas:

Además de las votaciones, la aplicación permitirá a los administradores crear y gestionar actas para documentar los resultados de las votaciones. Cada acta contendrá detalles como la fecha, el título, la descripción y un resumen de los puntos tratados y el resultado de las votaciones tomadas.

Seguridad y Verificabilidad:

La tecnología blockchain garantizará la seguridad y verificabilidad tanto de las votaciones como de las actas. Cada voto emitido y cada acta serán registros de la cadena de bloques. 

Estos registros tendràn que tener un código hash i una marca de tiempo UNIX. Los registros serán ubicados en la cadena de bloques que tenga la comunidad del administrador creador del registro.

Esto  permitirá a los miembros consultar la cadena de bloques y mirar la autenticidad de los resultados y prevenir la manipulación de terceros.

Habrá una cadena de bloques por comunidad pero esta cadena de bloques puede tener más de una comunidad, con el fin de optimizar recursos. La cadena de bloques será identificada por un número autoincremental, y tendrá el número de registros que tiene.

GLOSARIO

Comunidad: Grupo de personas con intereses comunes que participan en votaciones y toman decisiones dentro de un entorno descentralizado.

Acta: Documento que registra y documenta los resultados de un conjunto de votaciones, incluyendo detalles como la fecha, el título, la descripción y un resumen de los puntos tratados y las votaciones tomadas.

Marca de tiempo UNIX: Número que representa el tiempo transcurrido desde el 1 de enero de 1970 a las 00:00:00 UTC, utilizado para registrar la fecha y hora en los registros de la cadena de bloques.

Contrato inteligente: Código informático autónomo que se ejecuta en una cadena de bloques y que automatiza y asegura el cumplimiento de acuerdos digitales, como las reglas y el recuento de votaciones en esta aplicación.

Tecnología blockchain: Sistema de registro digital descentralizado y seguro que registra las transacciones en bloques enlazados y cifrados, proporcionando transparencia, seguridad y verificabilidad en las votaciones y actas.

Registro: Entrada de datos en la cadena de bloques, puede ser o una opcion votada o un acta.

Usuario: Individuo registrado en la aplicación que puede participar en votaciones y/o administrar comunidades. Un usuario puede ser miembro o administrador de una o más comunidades.

Votación: Proceso mediante el cual los miembros de una comunidad emiten sus preferencias sobre una propuesta o decisión específica. 

Opciones: Alternativas presentadas en una votación entre las cuales los miembros pueden elegir.

Cadena de bloques: infraestructura tecnológica subyacente utilizada para almacenar de manera segura y transparente los registros.
PD: Teóricamente cada bloque contendrá conjunto de transacciones y un hash criptográfico del bloque anterior, creando así una cadena secuencial de bloques(Registros). Esto significa que cada nuevo bloque está vinculado al anterior, formando una cadena continua y segura de datos.(Però para simplificar la pràctica no realizaré la funcionalidad de la cadena de bloques)




