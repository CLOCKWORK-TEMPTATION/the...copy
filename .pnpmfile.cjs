module.exports = {
  hooks: {
    readPackage(pkg) {
      // Auto-approve build scripts for these packages
      const approvedPackages = [
        "@firebase/util",
        "@sentry-internal/node-cpu-profiler",
        "bcrypt",
        "msgpackr-extract",
        "protobufjs",
        "unrs-resolver",
      ];

      if (approvedPackages.includes(pkg.name)) {
        console.log(`✅ Auto-approved build script for: ${pkg.name}`);
      }

      return pkg;
    },
  },
};
