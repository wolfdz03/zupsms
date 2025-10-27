#!/usr/bin/env node
/**
 * Script de test pour l'intégration Sweego SMS
 * Usage: npm run test:sms
 */

import { sendSMS, formatMessage } from "./lib/sweego.js";

async function testSweegoIntegration() {
  console.log("🧪 Test de l'intégration Sweego SMS\n");

  // Vérifier la configuration
  console.log("1. Vérification de la configuration...");
  if (!process.env.SWEEGO_API_KEY) {
    console.error("❌ SWEEGO_API_KEY non configuré");
    console.log("💡 Ajoutez SWEEGO_API_KEY dans votre fichier .env");
    process.exit(1);
  }
  console.log("✅ SWEEGO_API_KEY configuré");

  const senderId = process.env.SWEEGO_SENDER_ID || "ZUPdeCO";
  console.log(`✅ Sender ID: ${senderId}\n`);

  // Test de formatage de message
  console.log("2. Test de formatage de message...");
  const template = "Salut {student_name}, ton cours commence à {start_time} {day}.";
  const message = formatMessage(template, {
    student_name: "Test User",
    start_time: "14:00",
    day: "aujourd'hui"
  });
  console.log(`✅ Message formaté: "${message}"\n`);

  // Test d'envoi SMS (avec numéro de test)
  console.log("3. Test d'envoi SMS...");
  console.log("⚠️  Attention: Ceci va envoyer un vrai SMS!");
  
  const testPhone = process.argv[2];
  if (!testPhone) {
    console.log("💡 Usage: npm run test:sms +33123456789");
    console.log("💡 Ou utilisez l'endpoint /api/sms/test pour tester");
    return;
  }

  try {
    const result = await sendSMS(testPhone, message, senderId);
    
    if (result.success) {
      console.log(`✅ SMS envoyé avec succès!`);
      console.log(`📱 Message ID: ${result.messageId}`);
      console.log(`📊 Statut: ${result.status}`);
    } else {
      console.error(`❌ Échec de l'envoi: ${result.error}`);
    }
  } catch (error) {
    console.error(`❌ Erreur: ${error instanceof Error ? error.message : error}`);
  }
}

// Exécuter le test
testSweegoIntegration().catch(console.error);
