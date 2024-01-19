const mailjet = require("node-mailjet");

const sendMail = async (options) => {
  const mailjetClient = mailjet.connect(
    process.env.MJ_APIKEY_PUBLIC,
    process.env.MJ_APIKEY_PRIVATE
  );

  const request = mailjetClient.post("send", { version: "v3.1" }).request({
    Messages: [
      {
        From: {
          Email: process.env.MJ_SENDER_EMAIL,
          Name: process.env.MJ_SENDER_NAME,
        },
        To: [
          {
            Email: options.email,
            // Name: options.name,
          },
        ],
        Subject: options.subject,
        TextPart: options.message,
      },
    ],
  });

  try {
    const result = await request;
    console.log(result.body);
    return result.body;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

module.exports = sendMail;
