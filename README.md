# Development
## Running the application

Frontend and backend are running separately, frontend using npm, backend using gradle.

Frontend: ```npm run start```
Backend: ```SPRING_APPLICATION_JSON='{"spring":{"datasource":{"username":"aUsername","password":"aPassword"}}}' ./gradlew bootRun```
