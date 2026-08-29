const {
    withGradleProperties
} = require('@expo/config-plugins');

module.exports = function withReactNativeNodeModulesDir(config) {
    return withGradleProperties(config, (config) => {
        config.modResults.push({
            type: 'property',
            key: 'REACT_NATIVE_NODE_MODULES_DIR',
            value: '../../../node_modules/react-native',
        });
        return config;
    });
};