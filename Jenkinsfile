@Library('piper-library-os-acl') _
node() {
    stage('prepare') {
        checkout scm
        setupCommonPipelineEnvironment script:this, configFile: '.pipeline/config.yml'
    }
    stage('Build') {
        mtaBuild script: this
    }
    stage('deploy') {
        cloudFoundryDeploy script: this
        slackSendNotification script: this
    }
}
