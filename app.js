const express = require("express");
// const fs=require('fs');
const morgan = require("morgan");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
// const swaggerJsdoc =require('swagger-jsdoc');

const YAML = require("yamljs");
const swaggerDocument = YAML.load("./swagger/swagger.yaml");

const app = express();

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Basic File Routes //
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const roleRoutes = require("./routes/roleRoutes");
const patientRoutes = require("./routes/patientRoutes");
const labSectionRoutes = require("./routes/labSectionRoutes");
const laboratoryRoutes = require("./routes/laboratoryRoutes");
const instrumentRoutes = require("./routes/instrumentRoutes");
// Basic File Routes //

// Basic Routes //
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/roles", roleRoutes);
app.use("/patients", patientRoutes);
app.use("/lab-sections", labSectionRoutes);
app.use("/laboratories", laboratoryRoutes);
app.use("/instruments", instrumentRoutes);
// Basic Routes //

app.use("/public", express.static("public"));

app.get("/", (req, res) => {
  res.send({ message: "Welcome to TechnoLab API" });
});

// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });

// var PORT = ''
// if (process.env.NODE_ENV === "production") {
//     PORT = 4443
// } else {
//     PORT = 3000
// }
app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
