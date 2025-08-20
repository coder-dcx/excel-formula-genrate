import React, { useState } from 'react';
import './App.css';
import {
  Box,
  Typography,
  Grid,
  Paper,
  CardContent,
  CardHeader,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  IconButton,
  makeStyles,
} from '@material-ui/core';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
} from '@material-ui/icons';
import { TreeView, TreeItem } from '@material-ui/lab';

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: theme.spacing(2),
  },
  container: {
    maxWidth: 1400,
    margin: '0 auto',
  },
  header: {
    textAlign: 'center',
    marginBottom: theme.spacing(4),
    '& h3': {
      fontWeight: 'bold',
      textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
    }
  },
  previewSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    border: '1px solid rgba(255, 255, 255, 0.3)',
    boxShadow: '0 8px 32px rgba(31, 38, 135, 0.37)',
  },
  codeBlock: {
    backgroundColor: '#1e1e1e',
    color: '#d4d4d4',
    padding: theme.spacing(2),
    borderRadius: 8,
    fontFamily: 'Consolas, Monaco, monospace',
    fontSize: '12px',
    overflow: 'auto',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
  },
  treeRoot: {
    backgroundColor: '#263238',
    borderRadius: 12,
    padding: theme.spacing(2),
    color: '#ffffff',
    '& .MuiTreeItem-root': {
      '& .MuiTreeItem-content': {
        padding: theme.spacing(0.5, 1),
        borderRadius: 6,
        margin: theme.spacing(0.25, 0),
        backgroundColor: 'transparent',
        '&:hover': {
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
        },
        '& .MuiTreeItem-label': {
          fontSize: '14px',
          fontWeight: 500,
        },
      },
      '& .MuiTreeItem-group': {
        marginLeft: theme.spacing(1.5),
        paddingLeft: theme.spacing(1.5),
        borderLeft: '1px solid rgba(255, 255, 255, 0.12)',
      },
    },
  },
  treeItemOperator: {
    '& .MuiTreeItem-label': {
      color: '#81c784 !important',
    },
  },
  treeItemFunction: {
    '& .MuiTreeItem-label': {
      color: '#ffb74d !important',
    },
  },
  treeItemCondition: {
    '& .MuiTreeItem-label': {
      color: '#f06292 !important',
    },
  },
  treeItemValue: {
    '& .MuiTreeItem-label': {
      color: '#64b5f6 !important',
    },
  },
}));

const _cellValueList = ['A1', 'B1', 'C1', 'A2', 'B2', 'C2', 'A3', 'B3', 'C3', 'A1:A5', 'B1:B5', 'C1:C5', 'A1:C1', 'A2:C2'];
const _OperatorList = ['+', '-', '*', '/', '%', '&'];
const _ConditionList = ['=', '>', '<', '>=', '<=', '<>'];
const _FunctionList = ['lookup', 'sum', 'average', 'max', 'min'];

const SimpleFormulaNode = ({ node, onChange, classes, path }) => {
  if (!node) return null;

  const renderValueEditor = (node, onChange) => {
    switch (node.type) {
      case 'cellValue':
        return (
          <FormControl size="small" style={{ minWidth: 120 }}>
            <Select
              value={node.value}
              onChange={(e) => onChange({ ...node, value: e.target.value })}
              style={{ color: 'white', fontSize: '12px' }}
            >
              {_cellValueList.map((c) => (
                <MenuItem key={c} value={c}>{c}</MenuItem>
              ))}
            </Select>
          </FormControl>
        );
      
      case 'number':
        return (
          <TextField
            size="small"
            type="number"
            value={node.value}
            onChange={(e) => onChange({ ...node, value: Number(e.target.value) })}
            style={{ width: 80 }}
            InputProps={{ style: { color: 'white', fontSize: '12px' } }}
          />
        );
      
      case 'textbox':
        return (
          <TextField
            size="small"
            type="text"
            value={node.value}
            onChange={(e) => onChange({ ...node, value: e.target.value })}
            style={{ width: 120 }}
            InputProps={{ style: { color: 'white', fontSize: '12px' } }}
          />
        );
      
      case 'function':
        return (
          <FormControl size="small" style={{ minWidth: 120 }}>
            <Select
              value={node.name || 'lookup'}
              onChange={(e) => onChange({ ...node, name: e.target.value })}
              style={{ color: 'white', fontSize: '12px' }}
            >
              {_FunctionList.map((f) => (
                <MenuItem key={f} value={f}>{f.toUpperCase()}</MenuItem>
              ))}
            </Select>
          </FormControl>
        );
      
      case 'if':
        return (
          <Typography variant="body2" style={{ color: '#f06292' }}>
            🔀 IF Condition
          </Typography>
        );
      
      default:
        return <Typography variant="body2" style={{ color: 'white' }}>{node.value || 'N/A'}</Typography>;
    }
  };

  const renderTypeSelector = (node, onChange) => (
    <FormControl size="small" style={{ minWidth: 100, marginRight: 8 }}>
      <Select
        value={node.type}
        onChange={(e) => {
          const newType = e.target.value;
          let newNode = { type: newType };
          
          switch (newType) {
            case 'number':
              newNode.value = 0;
              break;
            case 'cellValue':
              newNode.value = 'A1';
              break;
            case 'textbox':
              newNode.value = '';
              break;
            case 'operator':
              newNode.operators = ['+'];
              newNode.args = [{ type: 'number', value: 0 }, { type: 'number', value: 0 }];
              break;
            case 'if':
              newNode.condition = {
                left: { type: 'number', value: 0 },
                operator: '=',
                right: { type: 'number', value: 0 }
              };
              newNode.trueValue = { type: 'number', value: 1 };
              newNode.falseValue = { type: 'number', value: 0 };
              break;
            case 'function':
              newNode.name = 'lookup';
              newNode.args = [{ type: 'cellValue', value: 'A1' }];
              break;
          }
          
          onChange(newNode);
        }}
        style={{ color: 'white', fontSize: '12px' }}
      >
        <MenuItem value="number">🔢 Number</MenuItem>
        <MenuItem value="cellValue">📊 Cell</MenuItem>
        <MenuItem value="textbox">📝 Text</MenuItem>
        <MenuItem value="operator">⚙️ Operator</MenuItem>
        <MenuItem value="if">🔀 IF</MenuItem>
        <MenuItem value="function">🔍 Function</MenuItem>
      </Select>
    </FormControl>
  );

  if (node.type === 'operator' && node.args) {
    return (
      <TreeItem
        nodeId={`${path}-operator`}
        label={
          <Box display="flex" alignItems="center" gap={1} onClick={e => e.stopPropagation()}>
            {renderTypeSelector(node, onChange)}
            <Typography variant="body2">⚙️ Operation</Typography>
            <Button
              size="small"
              variant="outlined"
              onClick={() => {
                const newArgs = [...node.args, { type: 'number', value: 0 }];
                const newOperators = [...(node.operators || ['+'])];
                if (newOperators.length < newArgs.length - 1) {
                  newOperators.push('+');
                }
                onChange({ ...node, args: newArgs, operators: newOperators });
              }}
              style={{ color: '#4fc3f7', borderColor: '#4fc3f7', marginLeft: 8 }}
            >
              + Add Arg
            </Button>
          </Box>
        }
        className={classes.treeItemOperator}
      >
        {node.args.map((arg, index) => (
          <React.Fragment key={index}>
            <TreeItem
              nodeId={`${path}-arg-${index}`}
              label={
                <Box display="flex" alignItems="center" gap={1} onClick={e => e.stopPropagation()}>
                  <Typography variant="body2">Arg {index + 1}:</Typography>
                  {node.args.length > 2 && (
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        const newArgs = node.args.filter((_, i) => i !== index);
                        const newOperators = (node.operators || []).filter((_, i) => i !== index || i === 0);
                        onChange({ ...node, args: newArgs, operators: newOperators.length > 0 ? newOperators : ['+'] });
                      }}
                      style={{ color: '#f48fb1' }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
              }
              className={classes.treeItemValue}
            >
              <SimpleFormulaNode
                node={arg}
                onChange={(newArg) => {
                  const newArgs = [...node.args];
                  newArgs[index] = newArg;
                  onChange({ ...node, args: newArgs });
                }}
                classes={classes}
                path={`${path}-arg-${index}`}
              />
            </TreeItem>
            {index < node.args.length - 1 && (
              <TreeItem
                nodeId={`${path}-op-${index}`}
                label={
                  <Box display="flex" alignItems="center" gap={1} onClick={e => e.stopPropagation()}>
                    <Typography variant="body2">Operator:</Typography>
                    <FormControl size="small" style={{ minWidth: 80 }}>
                      <Select
                        value={(node.operators || ['+'])[index] || '+'}
                        onChange={(e) => {
                          const newOperators = [...(node.operators || ['+'])];
                          newOperators[index] = e.target.value;
                          onChange({ ...node, operators: newOperators });
                        }}
                        style={{ color: 'white', fontSize: '12px' }}
                      >
                        {_OperatorList.map((op) => (
                          <MenuItem key={op} value={op}>{op}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                }
                className={classes.treeItemOperator}
              />
            )}
          </React.Fragment>
        ))}
      </TreeItem>
    );
  }

  // Handle IF condition type
  if (node.type === 'if') {
    return (
      <TreeItem
        nodeId={`${path}-if`}
        label={
          <Box display="flex" alignItems="center" gap={1} onClick={e => e.stopPropagation()}>
            {renderTypeSelector(node, onChange)}
            <Typography variant="body2">🔀 IF Condition</Typography>
          </Box>
        }
        className={classes.treeItemFunction}
      >
        <TreeItem
          nodeId={`${path}-condition`}
          label="🎯 Condition"
          className={classes.treeItemOperator}
        >
          <TreeItem
            nodeId={`${path}-condition-left`}
            label="📍 Left Side"
            className={classes.treeItemValue}
          >
            <SimpleFormulaNode
              node={node.condition?.left || { type: 'number', value: 0 }}
              onChange={(newVal) => {
                onChange({
                  ...node,
                  condition: { ...node.condition, left: newVal }
                });
              }}
              classes={classes}
              path={`${path}-condition-left`}
            />
          </TreeItem>
          <TreeItem
            nodeId={`${path}-condition-op`}
            label={
              <Box display="flex" alignItems="center" gap={1} onClick={e => e.stopPropagation()}>
                <Typography variant="body2">Operator:</Typography>
                <FormControl size="small" style={{ minWidth: 80 }}>
                  <Select
                    value={node.condition?.operator || '='}
                    onChange={(e) => {
                      onChange({
                        ...node,
                        condition: { ...node.condition, operator: e.target.value }
                      });
                    }}
                    style={{ color: 'white', fontSize: '12px' }}
                  >
                    {_ConditionList.map((c) => (
                      <MenuItem key={c} value={c}>{c}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            }
            className={classes.treeItemOperator}
          />
          <TreeItem
            nodeId={`${path}-condition-right`}
            label="📍 Right Side"
            className={classes.treeItemValue}
          >
            <SimpleFormulaNode
              node={node.condition?.right || { type: 'number', value: 0 }}
              onChange={(newVal) => {
                onChange({
                  ...node,
                  condition: { ...node.condition, right: newVal }
                });
              }}
              classes={classes}
              path={`${path}-condition-right`}
            />
          </TreeItem>
        </TreeItem>
        <TreeItem
          nodeId={`${path}-true`}
          label="✅ True Value"
          className={classes.treeItemValue}
        >
          <SimpleFormulaNode
            node={node.trueValue || { type: 'number', value: 1 }}
            onChange={(newVal) => {
              onChange({ ...node, trueValue: newVal });
            }}
            classes={classes}
            path={`${path}-true`}
          />
        </TreeItem>
        <TreeItem
          nodeId={`${path}-false`}
          label="❌ False Value"
          className={classes.treeItemValue}
        >
          <SimpleFormulaNode
            node={node.falseValue || { type: 'number', value: 0 }}
            onChange={(newVal) => {
              onChange({ ...node, falseValue: newVal });
            }}
            classes={classes}
            path={`${path}-false`}
          />
        </TreeItem>
      </TreeItem>
    );
  }

  // Handle Function type
  if (node.type === 'function') {
    return (
      <TreeItem
        nodeId={`${path}-function`}
        label={
          <Box display="flex" alignItems="center" gap={1} onClick={e => e.stopPropagation()}>
            {renderTypeSelector(node, onChange)}
            <Typography variant="body2">🔍 Function:</Typography>
            {renderValueEditor(node, onChange)}
            <Button
              size="small"
              variant="outlined"
              onClick={() => {
                const newArgs = [...(node.args || []), { type: 'cellValue', value: 'A1' }];
                onChange({ ...node, args: newArgs });
              }}
              style={{ color: '#4fc3f7', borderColor: '#4fc3f7', marginLeft: 8 }}
            >
              + Add Arg
            </Button>
          </Box>
        }
        className={classes.treeItemFunction}
      >
        {(node.args || []).map((arg, index) => (
          <TreeItem
            key={index}
            nodeId={`${path}-func-arg-${index}`}
            label={`📊 Argument ${index + 1}`}
            className={classes.treeItemValue}
          >
            <SimpleFormulaNode
              node={arg}
              onChange={(newArg) => {
                const newArgs = [...(node.args || [])];
                newArgs[index] = newArg;
                onChange({ ...node, args: newArgs });
              }}
              classes={classes}
              path={`${path}-func-arg-${index}`}
            />
            {(node.args || []).length > 1 && (
              <Box 
                display="flex" 
                alignItems="center" 
                gap={1} 
                style={{ marginTop: 8 }}
                onClick={e => e.stopPropagation()}
              >
                <Button
                  size="small"
                  variant="outlined"
                  color="secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    const newArgs = (node.args || []).filter((_, i) => i !== index);
                    onChange({ ...node, args: newArgs });
                  }}
                  startIcon={<DeleteIcon />}
                >
                  Remove Arg
                </Button>
              </Box>
            )}
          </TreeItem>
        ))}
      </TreeItem>
    );
  }

  // Simple leaf node
  return (
    <TreeItem
      nodeId={`${path}-leaf`}
      label={
        <Box display="flex" alignItems="center" gap={1} onClick={e => e.stopPropagation()}>
          {renderTypeSelector(node, onChange)}
          {renderValueEditor(node, onChange)}
        </Box>
      }
      className={classes.treeItemValue}
    />
  );
};

const SimpleFormulaBuilder = ({ formulas, setFormulas, classes }) => {
  const updateFormulaAtIndex = (idx, newNode) => {
    const newFormulas = [...formulas];
    newFormulas[idx] = newNode;
    setFormulas(newFormulas);
  };

  const addFormula = () => {
    setFormulas([
      ...formulas,
      {
        type: 'operator',
        operators: ['+'],
        args: [{ type: 'number', value: 0 }, { type: 'number', value: 0 }],
      },
    ]);
  };

  const removeFormula = (index) => {
    const newFormulas = formulas.filter((_, i) => i !== index);
    setFormulas(newFormulas);
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" color="primary">
          🌳 Interactive Formula Builder
        </Typography>
        <Button 
          onClick={addFormula} 
          variant="contained" 
          color="primary"
          startIcon={<AddIcon />}
        >
          Add New Formula
        </Button>
      </Box>

      <TreeView
        className={classes.treeRoot}
        defaultCollapseIcon={<ExpandMoreIcon />}
        defaultExpandIcon={<ExpandMoreIcon style={{ transform: 'rotate(-90deg)' }} />}
        defaultExpanded={['root']}
        style={{ color: '#ffffff', height: 'auto', maxHeight: 600, overflow: 'auto' }}
      >
        <TreeItem
          nodeId="root"
          label={
            <Typography variant="h6" style={{ fontWeight: 'bold', color: '#90caf9' }}>
              📋 Excel Formulas ({formulas.length})
            </Typography>
          }
          className={classes.treeItemFunction}
        >
          {formulas.map((formula, index) => (
            <TreeItem
              key={`formula-${index}`}
              nodeId={`formula-${index}`}
              label={
                <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
                  <Typography variant="body1" style={{ fontWeight: 'bold' }}>
                    📋 Formula {index + 1}
                  </Typography>
                  {formulas.length > 1 && (
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFormula(index);
                      }}
                      style={{ color: '#f48fb1', padding: 2 }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
              }
              className={classes.treeItemFunction}
            >
              <SimpleFormulaNode 
                node={formula} 
                onChange={(val) => updateFormulaAtIndex(index, val)} 
                classes={classes}
                path={`formula-${index}`}
              />
            </TreeItem>
          ))}
        </TreeItem>
      </TreeView>
    </Box>
  );
};

const generateExcelFormula = (node) => {
  if (!node) return '';

  switch (node.type) {
    case 'number':
      return node.value.toString();
    case 'cellValue':
      return node.value;
    case 'textbox':
      return `"${node.value}"`;
    case 'operator':
      if (node.args && node.args.length > 0) {
        const formulas = node.args.map(generateExcelFormula);
        const operators = node.operators || ['+'];
        let result = formulas[0];
        for (let i = 1; i < formulas.length; i++) {
          result += (operators[i-1] || '+') + formulas[i];
        }
        return `(${result})`;
      }
      return '0';
    case 'if':
      const leftFormula = generateExcelFormula(node.condition?.left || { type: 'number', value: 0 });
      const rightFormula = generateExcelFormula(node.condition?.right || { type: 'number', value: 0 });
      const trueFormula = generateExcelFormula(node.trueValue || { type: 'number', value: 1 });
      const falseFormula = generateExcelFormula(node.falseValue || { type: 'number', value: 0 });
      const operator = node.condition?.operator || '=';
      return `IF(${leftFormula}${operator}${rightFormula},${trueFormula},${falseFormula})`;
    case 'function':
      const funcName = (node.name || 'lookup').toUpperCase();
      const funcArgs = (node.args || []).map(generateExcelFormula).join(',');
      return `${funcName}(${funcArgs})`;
    default:
      return node.value?.toString() || '';
  }
};

// Excel Formula Parser/Decoder
const parseExcelFormula = (formula) => {
  try {
    // Remove leading = if present and trim
    formula = formula.trim().replace(/^=/, '');
    
    // Handle IF functions with better regex
    const ifMatch = formula.match(/^IF\s*\(\s*(.+?)\s*([>=<]+|<>)\s*(.+?)\s*,\s*(.+?)\s*,\s*(.+?)\s*\)$/i);
    if (ifMatch) {
      const [, left, operator, right, trueVal, falseVal] = ifMatch;
      return {
        type: 'if',
        condition: {
          left: parseExcelFormula(left.trim()),
          operator: operator.trim(),
          right: parseExcelFormula(right.trim())
        },
        trueValue: parseExcelFormula(trueVal.trim()),
        falseValue: parseExcelFormula(falseVal.trim())
      };
    }
    
    // Handle Functions with range support (A1:A5)
    const funcMatch = formula.match(/^(SUM|MAX|MIN|AVERAGE|LOOKUP)\s*\(\s*(.+?)\s*\)$/i);
    if (funcMatch) {
      const [, funcName, argsStr] = funcMatch;
      
      // Split arguments more carefully, considering nested functions
      const args = [];
      let currentArg = '';
      let parenCount = 0;
      
      for (let i = 0; i < argsStr.length; i++) {
        const char = argsStr[i];
        if (char === '(') parenCount++;
        else if (char === ')') parenCount--;
        else if (char === ',' && parenCount === 0) {
          args.push(parseExcelFormula(currentArg.trim()));
          currentArg = '';
          continue;
        }
        currentArg += char;
      }
      if (currentArg.trim()) {
        args.push(parseExcelFormula(currentArg.trim()));
      }
      
      return {
        type: 'function',
        name: funcName.toLowerCase(),
        args: args
      };
    }
    
    // Handle parentheses
    if (formula.startsWith('(') && formula.endsWith(')')) {
      formula = formula.slice(1, -1);
    }
    
    // Handle operators with precedence awareness
    const operators = ['+', '-', '*', '/', '%', '&'];
    for (const op of operators) {
      const parts = [];
      let currentPart = '';
      let parenCount = 0;
      
      for (let i = 0; i < formula.length; i++) {
        const char = formula[i];
        if (char === '(') parenCount++;
        else if (char === ')') parenCount--;
        else if (char === op && parenCount === 0) {
          parts.push(currentPart.trim());
          parts.push(op);
          currentPart = '';
          continue;
        }
        currentPart += char;
      }
      if (currentPart.trim()) parts.push(currentPart.trim());
      
      if (parts.length > 1) {
        const args = [];
        const ops = [];
        
        for (let i = 0; i < parts.length; i++) {
          if (i % 2 === 0) {
            args.push(parseExcelFormula(parts[i]));
          } else {
            ops.push(parts[i]);
          }
        }
        
        return {
          type: 'operator',
          operators: ops,
          args: args
        };
      }
    }
    
    // Handle cell ranges (A1:A5) - convert to cell reference for simplicity
    if (/^[A-Z]+\d+:[A-Z]+\d+$/i.test(formula)) {
      return {
        type: 'cellValue',
        value: formula.toUpperCase()
      };
    }
    
    // Handle cell references (A1, B2, etc.)
    if (/^[A-Z]+\d+$/i.test(formula)) {
      return {
        type: 'cellValue',
        value: formula.toUpperCase()
      };
    }
    
    // Handle text strings
    if (formula.startsWith('"') && formula.endsWith('"')) {
      return {
        type: 'textbox',
        value: formula.slice(1, -1)
      };
    }
    
    // Handle numbers
    if (!isNaN(formula) && !isNaN(parseFloat(formula))) {
      return {
        type: 'number',
        value: parseFloat(formula)
      };
    }
    
    // Default fallback for unknown patterns
    return {
      type: 'textbox',
      value: formula
    };
    
  } catch (error) {
    console.error('Error parsing formula:', error);
    return {
      type: 'textbox',
      value: formula
    };
  }
};

const FormulaBuilder = () => {
  const classes = useStyles();
  const [formulas, setFormulas] = useState([
    {
      type: 'operator',
      operators: ['+'],
      args: [
        { type: 'number', value: 10 },
        { type: 'number', value: 20 },
      ],
    },
  ]);
  
  const [inputFormula, setInputFormula] = useState('');

  const handleDecodeFormula = () => {
    if (inputFormula.trim()) {
      try {
        const decoded = parseExcelFormula(inputFormula);
        setFormulas([decoded]);
      } catch (error) {
        alert('Error decoding formula. Please check the syntax.');
      }
    }
  };

  return (
    <div className={classes.root}>
      <div className={classes.container}>
        <div className={classes.header}>
          <Typography variant="h3" color="primary" gutterBottom>
            🧮 Excel Formula Builder & Decoder
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Build complex Excel formulas using our interactive tree interface, or decode existing formulas. 
            Edit values directly in the tree structure and see real-time updates.
          </Typography>
        </div>

        {/* Formula Decoder Section */}
        <Paper className={classes.previewSection} style={{ marginBottom: 24 }}>
          <CardHeader 
            title="🔍 Excel Formula Decoder" 
            style={{ backgroundColor: '#388e3c', color: 'white' }}
            titleTypographyProps={{ variant: 'h6' }}
          />
          <CardContent>
            <Box display="flex" gap={2} alignItems="center" mb={2}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Enter Excel formula (e.g., =IF(A1>B1,SUM(C1:C5),MAX(D1:D5))"
                value={inputFormula}
                onChange={(e) => setInputFormula(e.target.value)}
                InputProps={{
                  style: { fontFamily: 'Consolas, Monaco, monospace' }
                }}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleDecodeFormula}
                disabled={!inputFormula.trim()}
                style={{ minWidth: 120 }}
              >
                🔄 Decode
              </Button>
            </Box>
            <Typography variant="body2" color="textSecondary">
              <strong>💡 Supported:</strong> IF conditions, Functions (SUM, MAX, MIN, AVERAGE, LOOKUP), 
              Operators (+, -, *, /, %), Cell references (A1, B2), Numbers, and Text strings
            </Typography>
            
            {/* Quick Examples */}
            <Box mt={2}>
              <Typography variant="body2" style={{ fontWeight: 'bold', marginBottom: 8 }}>
                🚀 Quick Examples:
              </Typography>
              <Box display="flex" gap={1} flexWrap="wrap">
                {[
                  '=IF(A1>B1,SUM(C1:C5),MAX(D1:D5))',
                  '=(A1+B1)*C1',
                  '=SUM(A1,B1,C1)',
                  '=IF(SUM(A1:A5)>100,"High","Low")'
                ].map((example, idx) => (
                  <Button
                    key={idx}
                    size="small"
                    variant="outlined"
                    onClick={() => setInputFormula(example)}
                    style={{ fontSize: '11px', textTransform: 'none' }}
                  >
                    {example}
                  </Button>
                ))}
              </Box>
            </Box>
          </CardContent>
        </Paper>

        <Grid container spacing={3}>
          {/* Interactive Tree Editor - Main Section */}
          <Grid item xs={12} lg={8}>
            <SimpleFormulaBuilder 
              formulas={formulas} 
              setFormulas={setFormulas} 
              classes={classes} 
            />
          </Grid>

          {/* Preview Section */}
          <Grid item xs={12} lg={4}>
            {/* JSON Preview */}
            <Paper className={classes.previewSection} style={{ marginBottom: 16 }}>
              <CardHeader 
                title="📊 JSON Preview" 
                style={{ backgroundColor: '#1976d2', color: 'white', fontSize: '14px' }}
                titleTypographyProps={{ variant: 'h6' }}
              />
              <CardContent>
                <div className={classes.codeBlock} style={{ maxHeight: 200 }}>
                  {JSON.stringify(formulas, null, 2)}
                </div>
              </CardContent>
            </Paper>

            {/* Excel Formula Output */}
            <Paper className={classes.previewSection}>
              <CardHeader 
                title="📋 Excel Formula" 
                style={{ backgroundColor: '#1976d2', color: 'white' }}
                titleTypographyProps={{ variant: 'h6' }}
              />
              <CardContent>
                <div className={classes.codeBlock} style={{ maxHeight: 150 }}>
                  = {formulas.map(generateExcelFormula).join(' + ')}
                </div>
                <Box mt={2} p={1.5} style={{ backgroundColor: '#e3f2fd', borderRadius: 8, border: '1px solid #bbdefb' }}>
                  <Typography variant="body2">
                    <strong>💡 Tip:</strong> Copy the formula and paste into Excel!
                  </Typography>
                </Box>
              </CardContent>
            </Paper>
          </Grid>
        </Grid>
      </div>
    </div>
  );
};

export default FormulaBuilder;
