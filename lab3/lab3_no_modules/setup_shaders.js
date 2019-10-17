var setup_shaders = (function() {
        // *** PRIVATE ***
        function getShader(gl_context, id) {
            var shaderScript = document.getElementById(id);
            if (!shaderScript) {
                alert("Failed to get shader script");
                return null;
            }

            var script_str = "";
            for (var child = shaderScript.firstChild; child; child = child.nextSibling) {
                if (child.nodeType = 3) {
                    // text node
                    script_str += child.textContent;
                }
            }

            var shader;
            if (shaderScript.type == "x-shader/x-fragment") {
                shader = gl_context.createShader(gl_context.FRAGMENT_SHADER);
            } else if (shaderScript.type == "x-shader/x-vertex") {
                shader = gl_context.createShader(gl_context.VERTEX_SHADER);
            } else {
                alert("Failed to get shader");
                return null;
            }

            gl_context.shaderSource(shader, script_str);
            gl_context.compileShader(shader);

            if (!gl_context.getShaderParameter(shader, gl_context.COMPILE_STATUS)) {
                alert(gl_context.getShaderInfoLog(shader));
                return null;
            }

            return shader;
        }

    return {
        // *** PUBLIC ***
        initShaders: function(gl_context) {
            shaderProgram = gl_context.createProgram();
            var fragmentShader = getShader(gl_context, "frag-shader");
            var vertexShader   = getShader(gl_context, "vertex-shader");

            gl_context.attachShader(shaderProgram, vertexShader);
            gl_context.attachShader(shaderProgram, fragmentShader);
            gl_context.linkProgram(shaderProgram);

            if (!gl_context.getProgramParameter(shaderProgram, gl_context.LINK_STATUS)) {
                alert("Could not initialize shaders");
            }

            gl_context.useProgram(shaderProgram);

            shaderProgram.vertexPositionAttribute = gl_context.getAttribLocation(shaderProgram, "position");
            gl_context.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

            return shaderProgram;
        }
    }
}());
