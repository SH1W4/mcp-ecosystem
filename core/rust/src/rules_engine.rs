use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use tokio::sync::RwLock;
use chrono::{DateTime, Utc};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Rule {
    pub id: String,
    pub name: String,
    pub description: String,
    pub category: RuleCategory,
    pub priority: u8,
    pub conditions: Vec<Condition>,
    pub actions: Vec<Action>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum RuleCategory {
    SessionManagement,
    CodeStyle,
    Security,
    Versioning,
    Monitoring,
    Quality,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Condition {
    pub field: String,
    pub operator: ConditionOperator,
    pub value: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ConditionOperator {
    Equals,
    NotEquals,
    Contains,
    GreaterThan,
    LessThan,
    VersionCheck,
    FileExists,
    CommandExists,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Action {
    pub action_type: ActionType,
    pub parameters: HashMap<String, String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ActionType {
    ExecuteCommand,
    CreateFile,
    ModifyFile,
    SendNotification,
    LogEvent,
    TriggerWorkflow,
}

pub struct RulesEngine {
    rules: RwLock<HashMap<String, Rule>>,
    context: RwLock<HashMap<String, String>>,
}

impl RulesEngine {
    pub fn new() -> Self {
        Self {
            rules: RwLock::new(HashMap::new()),
            context: RwLock::new(HashMap::new()),
        }
    }

    pub async fn register_rule(&self, rule: Rule) -> Result<(), String> {
        let mut rules = self.rules.write().await;
        rules.insert(rule.id.clone(), rule);
        Ok(())
    }

    pub async fn evaluate_rules(&self) -> Result<Vec<Action>, String> {
        let rules = self.rules.read().await;
        let context = self.context.read().await;
        let mut actions = Vec::new();

        for (_, rule) in rules.iter() {
            if self.evaluate_conditions(&rule.conditions, &context) {
                actions.extend(rule.actions.clone());
            }
        }

        // Sort by priority
        Ok(actions)
    }

    fn evaluate_conditions(
        &self,
        conditions: &[Condition],
        context: &HashMap<String, String>,
    ) -> bool {
        conditions.iter().all(|condition| {
            let context_value = context.get(&condition.field).unwrap_or(&String::new());
            
            match condition.operator {
                ConditionOperator::Equals => context_value == &condition.value,
                ConditionOperator::NotEquals => context_value != &condition.value,
                ConditionOperator::Contains => context_value.contains(&condition.value),
                ConditionOperator::GreaterThan => {
                    context_value.parse::<f64>().unwrap_or(0.0) 
                        > condition.value.parse::<f64>().unwrap_or(0.0)
                }
                ConditionOperator::LessThan => {
                    context_value.parse::<f64>().unwrap_or(0.0) 
                        < condition.value.parse::<f64>().unwrap_or(0.0)
                }
                ConditionOperator::VersionCheck => self.check_version(context_value, &condition.value),
                ConditionOperator::FileExists => std::path::Path::new(&condition.value).exists(),
                ConditionOperator::CommandExists => self.command_exists(&condition.value),
            }
        })
    }

    fn check_version(&self, current: &str, required: &str) -> bool {
        // Implementação simplificada de comparação de versões
        current >= required
    }

    fn command_exists(&self, command: &str) -> bool {
        std::process::Command::new("which")
            .arg(command)
            .output()
            .map(|output| output.status.success())
            .unwrap_or(false)
    }

    pub async fn update_context(&self, key: String, value: String) {
        let mut context = self.context.write().await;
        context.insert(key, value);
    }

    pub async fn load_default_rules(&self) -> Result<(), String> {
        // Session Management Rules
        self.register_rule(Rule {
            id: "session_git_check".to_string(),
            name: "Git Version Check".to_string(),
            description: "Verifica se Git está >= 2.40".to_string(),
            category: RuleCategory::SessionManagement,
            priority: 10,
            conditions: vec![Condition {
                field: "git_version".to_string(),
                operator: ConditionOperator::VersionCheck,
                value: "2.40".to_string(),
            }],
            actions: vec![Action {
                action_type: ActionType::LogEvent,
                parameters: HashMap::from([
                    ("level".to_string(), "info".to_string()),
                    ("message".to_string(), "Git version validated".to_string()),
                ]),
            }],
            created_at: Utc::now(),
            updated_at: Utc::now(),
        }).await?;

        // Code Style Rules
        self.register_rule(Rule {
            id: "code_style_prettier".to_string(),
            name: "Prettier Auto-format".to_string(),
            description: "Aplica formatação Prettier automaticamente".to_string(),
            category: RuleCategory::CodeStyle,
            priority: 8,
            conditions: vec![Condition {
                field: "file_extension".to_string(),
                operator: ConditionOperator::Equals,
                value: ".ts".to_string(),
            }],
            actions: vec![Action {
                action_type: ActionType::ExecuteCommand,
                parameters: HashMap::from([
                    ("command".to_string(), "prettier".to_string()),
                    ("args".to_string(), "--write".to_string()),
                ]),
            }],
            created_at: Utc::now(),
            updated_at: Utc::now(),
        }).await?;

        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_rules_engine() {
        let engine = RulesEngine::new();
        
        // Load default rules
        engine.load_default_rules().await.unwrap();
        
        // Update context
        engine.update_context("git_version".to_string(), "2.41.0".to_string()).await;
        
        // Evaluate rules
        let actions = engine.evaluate_rules().await.unwrap();
        assert!(!actions.is_empty());
    }
}

