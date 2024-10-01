export const generatePasswordResetEmail = (
  userName: string,
  resetCode: string,
) => {
  return `
    <!DOCTYPE html>
    <html lang="en">

    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
            }

            .container {
                max-width: 600px;
                margin: 50px auto;
                background-color: #ffffff;
                padding: 40px 50px;
                border-radius: 10px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }

            .header {
                text-align: center;
                padding: 10px 0;
                font-size: 30px;
                font-weight: bold;
                color: #333333;
            }

            .content {
                margin: 20px 0;
            }

            .content div {
                text-align: justify;
            }

            .content h1 {
                color: #333333;
            }

            .content p {
                font-size: 16px;
                color: #555555;
                line-height: 1.8;
            }

            .content span {
                display: inline-block;
                width: 50px;
            }

            .code {
                display: block;
                width: fit-content;
                margin: 30px auto 40px;
                text-align: center;
                background-color: #c0c0c0cb;
                color: black;
                padding: 12px 24px;
                border-radius: 5px;
                font-size: 24px;
                font-weight: bold;
                letter-spacing: 5px;
                transition: background-color 0.3s ease, transform 0.3s ease;
                cursor: pointer;
                letter-spacing: 10px;
            }

            .code:hover {
                background-color: #c0c0c0;
            }

            .footer {
                text-align: center;
                font-size: 14px;
                color: #aaaaaa;
                margin-top: 20px;
            }

            .toast {
                visibility: hidden;
                min-width: 250px;
                background-color: #c0c0c06f;
                color: black;
                font-weight: bold;
                text-align: center;
                border-radius: 4px;
                padding: 16px;
                position: fixed;
                z-index: 10;
                right: 20px;
                top: 20px;
                font-size: 17px;
            }

            .toast.show {
                visibility: visible;
                -webkit-animation: fadein 0.5s, fadeout 0.5s 2s;
                animation: fadein 0.5s, fadeout 0.5s 2s;
            }

            @-webkit-keyframes fadein {
                from {
                    top: 0;
                    opacity: 0;
                }

                to {
                    top: 20px;
                    opacity: 1;
                }
            }

            @keyframes fadein {
                from {
                    top: 0;
                    opacity: 0;
                }

                to {
                    top: 20px;
                    opacity: 1;
                }
            }

            @-webkit-keyframes fadeout {
                from {
                    top: 20px;
                    opacity: 1;
                }

                to {
                    top: 0;
                    opacity: 0;
                }
            }

            @keyframes fadeout {
                from {
                    top: 20px;
                    opacity: 1;
                }

                to {
                    top: 0;
                    opacity: 0;
                }
            }
        </style>
    </head>

    <body>
        <div class="container">
            <div class="header">
                Plant Plans
            </div>
            <div class="content">
                <h3>Password Reset Request</h2>
                    <div>
                        <p>Hello, <strong> ${userName} </strong></p>
                        <p> <span></span> We received a request to reset your password for your Plant Plans account.
                            Use the 6-digit code below to reset your password.
                            If you did not request this, please ignore this email.</p>
                        <div class="code" id="resetCode">${resetCode}</div>
                        <p>*The code will expire in 10 minutes.</p>
                    </div>
            </div>
            <div class="footer">
                <p>&copy; 2024 Plant Plans. All rights reserved.</p>
            </div>
        </div>

        <!-- Toast notification -->
        <div id="toast" class="toast">Code copied to clipboard</div>

        <script>
            // Select the reset code element
            const resetCodeElement = document.getElementById('resetCode');

            // Function to copy text to clipboard and show toast
            resetCodeElement.addEventListener('click', function () {
                // Copy the code text to clipboard
                const codeText = resetCodeElement.textContent;
                navigator.clipboard.writeText(codeText).then(function () {
                    // Show toast message
                    const toast = document.getElementById('toast');
                    toast.className = "toast show";

                    // Hide the toast after 2 seconds
                    setTimeout(function () {
                        toast.className = toast.className.replace("show", "");
                    }, 2000);
                }).catch(function (error) {
                    console.error('Failed to copy text: ', error);
                });
            });
        </script>
    </body>

    </html>
    `;
};
