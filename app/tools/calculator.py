import ast
import operator
from typing import Union
from app.observability.logging import get_logger

logger = get_logger(__name__)

# Supported safe arithmetic operators
SAFE_OPERATORS = {
    ast.Add: operator.add,
    ast.Sub: operator.sub,
    ast.Mult: operator.mul,
    ast.Div: operator.truediv,
    ast.Pow: operator.pow,
    ast.Mod: operator.mod,
    ast.USub: operator.neg,
    ast.UAdd: operator.pos,
}


def _eval_node(node: ast.AST) -> Union[int, float]:
    """Recursively evaluates safe mathematical AST nodes."""
    if isinstance(node, ast.Constant):
        if isinstance(node.value, (int, float)):
            return node.value
        raise ValueError(f"Unsupported constant type: {type(node.value)}")

    elif isinstance(node, ast.BinOp):
        left = _eval_node(node.left)
        right = _eval_node(node.right)
        op_type = type(node.op)
        if op_type in SAFE_OPERATORS:
            return SAFE_OPERATORS[op_type](left, right)
        raise ValueError(f"Unsupported operator: {op_type}")

    elif isinstance(node, ast.UnaryOp):
        operand = _eval_node(node.operand)
        op_type = type(node.op)
        if op_type in SAFE_OPERATORS:
            return SAFE_OPERATORS[op_type](operand)
        raise ValueError(f"Unsupported unary operator: {op_type}")

    raise ValueError(f"Unsupported syntax in expression: {type(node).__name__}")


class CalculatorTool:
    """Safe mathematical calculator tool for engineering tolerances and sensor differences."""

    @property
    def name(self) -> str:
        return "calculator"

    @property
    def description(self) -> str:
        return "Safely evaluates numerical and mathematical expressions for engineering checks."

    def calculate(self, expression: str) -> Union[int, float]:
        """
        Parses and evaluates mathematical expression safely using AST without eval().
        Example: '12.5 - 8.2' or '45 * 1.15'
        """
        cleaned_expr = expression.strip()
        try:
            tree = ast.parse(cleaned_expr, mode="eval")
            result = _eval_node(tree.body)
            logger.info(f"Calculator evaluated '{cleaned_expr}' = {result}")
            return round(result, 4)
        except Exception as e:
            logger.error(f"Calculator error evaluating '{cleaned_expr}': {e}")
            raise ValueError(f"Invalid mathematical expression '{cleaned_expr}': {str(e)}")
