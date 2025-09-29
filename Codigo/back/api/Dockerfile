# ====== Build ======
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app

# Baixa dependências para cachear
COPY pom.xml ./
RUN mvn -q -DskipTests dependency:go-offline

# Copia o código e compila
COPY src ./src
RUN mvn -q -DskipTests package

# ====== Runtime ======
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# Render usa a variável PORT; seu app deve aceitar isso
ENV TZ=America/Sao_Paulo
EXPOSE 8080

# Copia o jar gerado
COPY --from=build /app/target/*.jar /app/app.jar

# Ajustes de memória em container
ENV JAVA_TOOL_OPTIONS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -XX:+ExitOnOutOfMemoryError"

ENTRYPOINT ["java","-jar","/app/app.jar"]
