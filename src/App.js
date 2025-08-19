import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Chip,
  Box,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Divider
} from '@material-ui/core';
import {
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Functions as FunctionsIcon,
  Code as CodeIcon
} from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import './App.css';

const _cellValueList = ['cell value 1', 'cell value 2', 'cell value 3', 'cell value 4'];
const _OperatorList = ['+', '-', '*', '/'];
const _ConditionList = ['==', '>=', '<=', '<>'];
const _FunctionList = ['cellValue', 'number', 'textbox', 'operator', 'if', 'lookup'];

const useStyles = makeStyles((theme) => ({
  root: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: theme.spacing(2),
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    minHeight: '100vh',
  },
  container: {
    backgroundColor: 'white',
    borderRadius: theme.spacing(1),
    padding: theme.spacing(3),
    margin: theme.spacing(1, 0),
  },
  header: {
    textAlign: 'center',
    marginBottom: theme.spacing(3),
    paddingBottom: theme.spacing(2),
    borderBottom: `2px solid ${theme.palette.divider}`,
  },
  formulaSection: {
    marginBottom: theme.spacing(2),
  },
  nodeContainer: {
    padding: theme.spacing(1.5),
    marginBottom: theme.spacing(1),
    border: `2px solid ${theme.palette.divider}`,
    borderRadius: theme.spacing(1),
    backgroundColor: 'white',
  },
  operatorChip: {
    margin: theme.spacing(0.5),
  },
  previewSection: {
    marginTop: theme.spacing(2),
  },
  codeBlock: {
    backgroundColor: '#f5f5f5',
    padding: theme.spacing(2),
    borderRadius: theme.spacing(1),
    fontFamily: 'Courier New, monospace',
    fontSize: '12px',
    whiteSpace: 'pre-wrap',
    wordWrap: 'break-word',
    maxHeight: 300,
    overflow: 'auto',
  },
}));

const Collapsible = ({ label, children }) => {
  const [expanded, setExpanded] = useState(true);
  
  return (
    <Accordion expanded={expanded} onChange={() => setExpanded(!expanded)}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="body2" component="div">
          {label}
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Box width="100%">
          {children}
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};

const FormulaNode = ({ node, onChange }) => {
  const classes = useStyles();
  
  // Determine type key for dropdown (function:lookup -> lookup)
  const selectedType =
    node.type === 'function' && node.name === 'lookup' ? 'lookup' : node.type;

  const changeType = (e) => {
    const type = e.target.value;
    switch (type) {
      case 'cellValue':
        onChange({ type: 'cellValue', value: _cellValueList[0] });
        break;
      case 'number':
        onChange({ type: 'number', value: 0 });
        break;
      case 'textbox':
        onChange({ type: 'textbox', value: '' });
        break;
      case 'operator':
        onChange({
          type: 'operator',
          operators: ['+'], // Array of operators between arguments
          args: [{ type: 'number', value: 0 }, { type: 'number', value: 0 }],
        });
        break;
      case 'if':
        onChange({
          type: 'if',
          condition: {
            operator: '==',
            left: { type: 'cellValue', value: _cellValueList[0] },
            right: { type: 'number', value: 0 },
          },
          trueValue: { type: 'number', value: 0 },
          falseValue: { type: 'number', value: 0 },
        });
        break;
      case 'lookup':
        onChange({
          type: 'function',
          name: 'lookup',
          args: [
            { type: 'cellValue', value: _cellValueList[0] },
            { type: 'cellValue', value: 'STRUC_HRS' },
            { type: 'cellValue', value: _cellValueList[1] },
          ],
        });
        break;
      default:
        break;
    }
  };

  const resetNode = () => changeType({ target: { value: selectedType } });

  const renderTypeControl = () => (
    <Box display="flex" alignItems="center" gap={1} mb={1}>
      <FormControl size="small" style={{ minWidth: 120 }}>
        <InputLabel>Type</InputLabel>
        <Select
          value={selectedType}
          onChange={changeType}
          onClick={(e) => e.stopPropagation()}
        >
          {_FunctionList.map((f) => (
            <MenuItem key={f} value={f}>
              {f}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Button
        size="small"
        variant="outlined"
        startIcon={<RefreshIcon />}
        onClick={(e) => {
          e.stopPropagation();
          resetNode();
        }}
      >
        Reset
      </Button>
    </Box>
  );

  switch (node.type) {
    case 'cellValue':
      return (
        <Paper className={classes.nodeContainer}>
          {renderTypeControl()}
          <FormControl fullWidth size="small">
            <InputLabel>Select Cell Value</InputLabel>
            <Select
              value={node.value}
              onChange={(e) => onChange({ ...node, value: e.target.value })}
            >
              {_cellValueList.map((c) => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Paper>
      );

    case 'number':
      return (
        <Paper className={classes.nodeContainer}>
          {renderTypeControl()}
          <TextField
            fullWidth
            size="small"
            label="Enter Number"
            type="number"
            value={node.value}
            onChange={(e) => onChange({ ...node, value: Number(e.target.value) })}
            placeholder="Enter a number"
          />
        </Paper>
      );

    case 'textbox':
      return (
        <Paper className={classes.nodeContainer}>
          {renderTypeControl()}
          <TextField
            fullWidth
            size="small"
            label="Enter Text"
            type="text"
            value={node.value}
            onChange={(e) => onChange({ ...node, value: e.target.value })}
            placeholder="Enter text value"
          />
        </Paper>
      );

    case 'operator':
      return (
        <Collapsible
          label={
            <Box display="flex" alignItems="center" onClick={(e) => e.stopPropagation()}>
              {renderTypeControl()}
              <Box display="flex" alignItems="center" ml={1}>
                <FunctionsIcon color="primary" />
                <Typography variant="body2" color="primary" style={{ fontWeight: 'bold', marginLeft: 8 }}>
                  Operator: {node.operators ? node.operators.join(' ') : node.operator || '+'}
                </Typography>
              </Box>
            </Box>
          }
        >
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" color="primary">
                📋 Arguments & Operators
              </Typography>
              <Button
                size="small"
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => {
                  const newArgs = [...(node.args || []), { type: 'number', value: 0 }];
                  const newOperators = [...(node.operators || [node.operator] || ['+']), '+'];
                  onChange({
                    ...node,
                    args: newArgs,
                    operators: newOperators,
                  });
                }}
              >
                Add Argument
              </Button>
            </Box>
            
            {(node.args || []).map((arg, i) => (
              <Box key={i} mb={2}>
                {/* Argument */}
                <Paper className={classes.nodeContainer}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="body2" style={{ fontWeight: 'bold', color: '#6c757d' }}>
                      Argument {i + 1}
                    </Typography>
                    {(node.args || []).length > 2 && (
                      <IconButton
                        size="small"
                        color="secondary"
                        onClick={() => {
                          const newArgs = node.args.filter((_, idx) => idx !== i);
                          const newOperators = (node.operators || []).filter((_, idx) => idx !== i || idx === 0);
                          onChange({ 
                            ...node, 
                            args: newArgs,
                            operators: newOperators.length > 0 ? newOperators : ['+']
                          });
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </Box>
                  <FormulaNode
                    node={arg}
                    onChange={(val) => {
                      const newArgs = [...node.args];
                      newArgs[i] = val;
                      onChange({ ...node, args: newArgs });
                    }}
                  />
                </Paper>
                
                {/* Operator after this argument (except for the last argument) */}
                {i < (node.args || []).length - 1 && (
                  <Box display="flex" justifyContent="center" my={1}>
                    <FormControl size="small" style={{ minWidth: 150 }}>
                      <InputLabel>Operator</InputLabel>
                      <Select
                        value={(node.operators || [node.operator] || ['+'])[i] || '+'}
                        onChange={(e) => {
                          const newOperators = [...(node.operators || [node.operator] || ['+'])];
                          newOperators[i] = e.target.value;
                          onChange({ 
                            ...node, 
                            operators: newOperators,
                            operator: undefined // Remove old single operator property
                          });
                        }}
                      >
                        {_OperatorList.map((op) => (
                          <MenuItem key={op} value={op}>
                            {op} ({op === '+' ? 'Add' : op === '-' ? 'Subtract' : op === '*' ? 'Multiply' : 'Divide'})
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        </Collapsible>
      );

    case 'if':
      return (
        <Collapsible
          label={
            <div onClick={(e) => e.stopPropagation()}>
              {renderTypeControl()} 
              <span style={{ marginLeft: '10px', color: '#0066cc', fontWeight: 'bold' }}>
                🔀 IF Condition
              </span>
            </div>
          }
        >
          <div className="form-group">
            <h4 style={{ color: '#0066cc', marginBottom: '10px', fontSize: '14px' }}>🔍 Condition:</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '8px', alignItems: 'end', marginBottom: '15px' }}>
              <div>
                <label className="form-label">Left Side:</label>
                <FormulaNode
                  node={node.condition.left}
                  onChange={(val) =>
                    onChange({
                      ...node,
                      condition: { ...node.condition, left: val },
                    })
                  }
                />
              </div>
              <div>
                <label className="form-label">Comparison:</label>
                <select
                  value={node.condition.operator}
                  onChange={(e) =>
                    onChange({
                      ...node,
                      condition: { ...node.condition, operator: e.target.value },
                    })
                  }
                  className="form-control"
                  style={{ minWidth: '70px' }}
                >
                  {_ConditionList.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">Right Side:</label>
                <FormulaNode
                  node={node.condition.right}
                  onChange={(val) =>
                    onChange({
                      ...node,
                      condition: { ...node.condition, right: val },
                    })
                  }
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h4 style={{ color: '#28a745', margin: 0, fontSize: '14px' }}>✅ True Value:</h4>
              <button
                className="btn btn-success btn-small"
                onClick={() =>
                  onChange({
                    ...node,
                    trueValue: { type: 'number', value: 0 },
                  })
                }
              >
                🔄 Reset to Simple
              </button>
            </div>
            <FormulaNode
              node={node.trueValue}
              onChange={(val) => onChange({ ...node, trueValue: val })}
            />
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h4 style={{ color: '#dc3545', margin: 0, fontSize: '14px' }}>❌ False Value:</h4>
              <button
                className="btn btn-danger btn-small"
                onClick={() =>
                  onChange({
                    ...node,
                    falseValue: { type: 'number', value: 0 },
                  })
                }
              >
                🔄 Reset to Simple
              </button>
            </div>
            <FormulaNode
              node={node.falseValue}
              onChange={(val) => onChange({ ...node, falseValue: val })}
            />
          </div>
        </Collapsible>
      );

    case 'function':
      if (node.name === 'lookup') {
        return (
          <Collapsible
            label={
              <div onClick={(e) => e.stopPropagation()}>
                {renderTypeControl()} 
                <span style={{ marginLeft: '10px', color: '#0066cc', fontWeight: 'bold' }}>
                  🔍 Function: LOOKUP
                </span>
              </div>
            }
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h4 style={{ color: '#0066cc', margin: 0, fontSize: '14px' }}>📋 Function Arguments:</h4>
              <button
                className="btn btn-success btn-small"
                onClick={() =>
                  onChange({
                    ...node,
                    args: [...node.args, { type: 'number', value: 0 }],
                  })
                }
              >
                ➕ Add Argument
              </button>
            </div>
            {node.args.map((arg, i) => (
              <div key={i} className="node-container" style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 'bold', color: '#6c757d', fontSize: '12px' }}>
                    Argument {i + 1} {i === 0 ? '(Lookup Value)' : i === 1 ? '(Lookup Array)' : i === 2 ? '(Result Array)' : ''}
                  </span>
                  <button
                    className="btn btn-danger btn-small"
                    onClick={() => {
                      const newArgs = node.args.filter((_, idx) => idx !== i);
                      onChange({ ...node, args: newArgs });
                    }}
                  >
                    🗑️ Remove
                  </button>
                </div>
                <FormulaNode
                  node={arg}
                  onChange={(val) => {
                    const newArgs = [...node.args];
                    newArgs[i] = val;
                    onChange({ ...node, args: newArgs });
                  }}
                />
              </div>
            ))}
          </Collapsible>
        );
      }
      break;

    default:
      return <div>Unknown type</div>;
  }
};

const generateExcelFormula = (node) => {
  if (!node) return '';
  switch (node.type) {
    case 'cellValue':
      return node.value;
    case 'number':
      return node.value.toString();
    case 'textbox':
      return `"${node.value}"`;
    case 'operator':
      // Handle new operators array format or legacy single operator
      if (node.args && node.args.length > 0) {
        if (node.operators && node.operators.length > 0) {
          // New format: individual operators between arguments
          let result = generateExcelFormula(node.args[0]);
          for (let i = 1; i < node.args.length; i++) {
            const operator = node.operators[i - 1] || '+';
            result += operator + generateExcelFormula(node.args[i]);
          }
          return `(${result})`;
        } else if (node.operator) {
          // Legacy format: same operator for all
          return `(${node.args.map(generateExcelFormula).join(node.operator)})`;
        }
      }
      return '';
    case 'if':
      return `IF(${generateExcelFormula(node.condition.left)}${node.condition.operator}${generateExcelFormula(
        node.condition.right
      )},${generateExcelFormula(node.trueValue)},${generateExcelFormula(node.falseValue)})`;
    case 'function':
      if (node.name === 'lookup') {
        return `LOOKUP(${node.args.map(generateExcelFormula).join(',')})`;
      }
      return '';
    default:
      return '';
  }
};

const FormulaBuilder = () => {
  const [formulas, setFormulas] = useState([
    {
      type: 'operator',
      operators: ['+'],
      args: [
        { type: 'number', value: 0 },
        { type: 'number', value: 0 },
      ],
    },
  ]);

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
    <div className="App">
      <div className="formula-builder-container">
        <div className="header">
          <h1>🧮 Excel Formula Builder</h1>
          <p>
            Build complex Excel formulas visually using our intuitive interface. 
            Create nested formulas, add conditions, and see real-time previews of your work.
          </p>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h2 style={{ color: '#0066cc', margin: 0, fontSize: '1.4rem' }}>📝 Formula Sections</h2>
            <button onClick={addFormula} className="btn btn-success">
              ➕ Add New Formula
            </button>
          </div>

          {formulas.map((f, i) => (
            <div key={i} className="formula-section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h3 style={{ color: '#0066cc', margin: 0, fontSize: '1.1rem' }}>Formula {i + 1}</h3>
                {formulas.length > 1 && (
                  <button 
                    onClick={() => removeFormula(i)} 
                    className="btn btn-danger btn-small"
                  >
                    🗑️ Remove
                  </button>
                )}
              </div>
              <FormulaNode node={f} onChange={(val) => updateFormulaAtIndex(i, val)} />
            </div>
          ))}
        </div>

        <div className="preview-section">
          <div className="preview-header">
            📊 JSON Preview
          </div>
          <div className="preview-content">
            <code>{JSON.stringify(formulas, null, 2)}</code>
          </div>
        </div>

        <div className="preview-section">
          <div className="preview-header">
            📋 Excel Formula Output
          </div>
          <div className="preview-content">
            <code>= {formulas.map(generateExcelFormula).join(' + ')}</code>
            <div style={{ marginTop: '10px', padding: '8px', background: '#e7f3ff', borderRadius: '6px', border: '1px solid #b3d9ff' }}>
              <strong>💡 Tip:</strong> Copy the formula above and paste it directly into Excel!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormulaBuilder;
