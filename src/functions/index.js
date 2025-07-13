const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

exports.sendOrderStatusNotification = functions.https.onCall(
  async (data, context) => {
    const orderId = data.orderId;
    const newStatus = data.newStatus;

    if (!orderId || !newStatus) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "O ID do pedido e o novo status são obrigatórios."
      );
    }

    try {
      const deviceTokenDoc = await admin
        .firestore()
        .collection("deviceTokens")
        .doc(orderId)
        .get();
      if (!deviceTokenDoc.exists || !deviceTokenDoc.data().token) {
        console.warn(
          `Token FCM não encontrado ou vazio para o pedido ${orderId}.`
        );
        return { success: false, message: "Token FCM não encontrado." };
      }
      const fcmToken = deviceTokenDoc.data().token;

      const orderDoc = await admin
        .firestore()
        .collection("orders")
        .doc(orderId)
        .get();
      const orderData = orderDoc.data();
      const clientName = orderData?.clientName || "Cliente";
      const comboName = orderData?.combo || "o pedido";

      const message = {
        notification: {
          title: "Seu pedido está pronto!",
          body: `Olá ${clientName}! Seu ${comboName} está pronto para retirada.`,
        },
        data: {
          orderId: orderId,
          status: newStatus,
        },
        token: fcmToken,
      };

      const response = await admin.messaging().send(message);
      console.log("Notificação enviada com sucesso:", response);
      return { success: true, message: "Notificação enviada." };
    } catch (error) {
      console.error("Erro ao enviar notificação:", error);
      throw new functions.https.HttpsError(
        "internal",
        "Erro ao enviar notificação.",
        error.message
      );
    }
  }
);

exports.onOrderStatusChange = functions.firestore
  .document("orders/{orderId}")
  .onUpdate(async (change, context) => {
    const newValue = change.after.data();
    const previousValue = change.before.data();
    const orderId = context.params.orderId;

    if (previousValue.status !== "ready" && newValue.status === "ready") {
      try {
        const deviceTokenDoc = await admin
          .firestore()
          .collection("deviceTokens")
          .doc(orderId)
          .get();
        if (!deviceTokenDoc.exists || !deviceTokenDoc.data().token) {
          console.warn(
            `Token FCM não encontrado ou vazio para o pedido ${orderId}.`
          );
          return null;
        }
        const fcmToken = deviceTokenDoc.data().token;
        const clientName = newValue.clientName || "Cliente";
        const comboName = newValue.combo || "o pedido";

        const message = {
          notification: {
            title: "Seu pedido está pronto!",
            body: `Olá ${clientName}! Seu ${comboName} está pronto para retirada.`,
          },
          data: {
            orderId: orderId,
            status: "ready",
          },
          token: fcmToken,
        };

        const response = await admin.messaging().send(message);
        console.log("Notificação de status de pedido enviada:", response);
      } catch (error) {
        console.error("Erro ao enviar notificação de status de pedido:", error);
      }
    }
    return null;
  });
