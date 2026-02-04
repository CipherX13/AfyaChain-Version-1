const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying Afya-Chain smart contracts...");
  
  // Deploy PatientRegistry
  console.log("📝 Deploying PatientRegistry...");
  const PatientRegistry = await hre.ethers.getContractFactory("PatientRegistry");
  const patientRegistry = await PatientRegistry.deploy();
  await patientRegistry.waitForDeployment();
  const patientRegistryAddress = await patientRegistry.getAddress();
  console.log(`✅ PatientRegistry deployed to: ${patientRegistryAddress}`);
  
  // Deploy HealthRecord
  console.log("📝 Deploying HealthRecord...");
  const HealthRecord = await hre.ethers.getContractFactory("HealthRecord");
  const healthRecord = await HealthRecord.deploy();
  await healthRecord.waitForDeployment();
  const healthRecordAddress = await healthRecord.getAddress();
  console.log(`✅ HealthRecord deployed to: ${healthRecordAddress}`);
  
  // Deploy ConsentManager with PatientRegistry address
  console.log("📝 Deploying ConsentManager...");
  const ConsentManager = await hre.ethers.getContractFactory("ConsentManager");
  const consentManager = await ConsentManager.deploy(patientRegistryAddress);
  await consentManager.waitForDeployment();
  const consentManagerAddress = await consentManager.getAddress();
  console.log(`✅ ConsentManager deployed to: ${consentManagerAddress}`);
  
  // Save contract addresses to a file for backend use
  const fs = require("fs");
  const contracts = {
    patientRegistry: patientRegistryAddress,
    healthRecord: healthRecordAddress,
    consentManager: consentManagerAddress,
    network: "localhost:8545",
    chainId: 31337
  };
  
  fs.writeFileSync(
    "../backend/contract-addresses.json",
    JSON.stringify(contracts, null, 2)
  );
  
  console.log("\n📝 Contract addresses saved to backend/contract-addresses.json");
  console.log("🎉 Deployment complete!");
  
  // Print summary
  console.log("\n📋 CONTRACT ADDRESSES:");
  console.log("─────────────────────────");
  console.log(`PatientRegistry:  ${patientRegistryAddress}`);
  console.log(`HealthRecord:     ${healthRecordAddress}`);
  console.log(`ConsentManager:   ${consentManagerAddress}`);
  console.log("─────────────────────────");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});