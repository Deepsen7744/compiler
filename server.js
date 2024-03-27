const express = require("express");
const app = express();
const bodyP = require("body-parser");
const compiler = require("compilex");

const options = { stats: true };
compiler.init(options);

app.use(bodyP.json());

app.post("/compile", function (req, res) {
    try {
        const { code, input, lang } = req.body;
        var envData = { OS: "windows" };

        let compileFunction, compileArgs;
        switch (lang) {
            case "Cpp":
                envData.cmd = "g++"; 
                compileFunction = input ? compiler.compileCPPWithInput : compiler.compileCPP;
                compileArgs = input ? [envData, code, input] : [envData, code];
                break;
            case "Java":
                compileFunction = input ? compiler.compileJavaWithInput : compiler.compileJava;
                compileArgs = input ? [envData, code, input] : [envData, code];
                break;
            case "Python":
                compileFunction = input ? compiler.compilePythonWithInput : compiler.compilePython;
                compileArgs = input ? [envData, code, input] : [envData, code];
                break;
            default:
                return res.status(400).send({ error: "Unsupported language" });
        }

        compileFunction(...compileArgs, function (data) {
            if (data.output) {
                res.send(data);
            } else if (data.error) { 
                res.status(400).send({ error: data.error });
            } else {
                res.send({ output: "error" });
            }
        });
    } catch (e) {
        console.error("Error:", e);
        res.status(500).send({ error: "Internal server error" });
    }
});


const PORT = 8000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
