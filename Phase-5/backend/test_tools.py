"""Test MCP tools directly without requiring Gemini API."""

from agents import RunContextWrapper
from app.mcp_server.agent_tools import add_task, list_tasks, complete_task, update_task, delete_task

# Create a mock context with user_id
class MockContext:
    def __init__(self, user_id):
        self.context = {"user_id": user_id}

    def get(self, key):
        return self.context.get(key)

# Create context wrapper
ctx = MockContext("test-user-123")

print("=" * 50)
print("Testing MCP Tools")
print("=" * 50)

# Test 1: Add tasks
print("\n1. Adding tasks...")
result1 = add_task(ctx, title="Buy groceries", description="Milk, eggs, bread")
print(f"   {result1}")

result2 = add_task(ctx, title="Call dentist")
print(f"   {result2}")

result3 = add_task(ctx, title="Finish project report", description="Due Friday")
print(f"   {result3}")

# Test 2: List all tasks
print("\n2. Listing all tasks...")
result = list_tasks(ctx, status="all")
print(f"   {result}")

# Test 3: List pending tasks
print("\n3. Listing pending tasks...")
result = list_tasks(ctx, status="pending")
print(f"   {result}")

# Test 4: Complete a task
print("\n4. Completing task 1...")
result = complete_task(ctx, task_id=1)
print(f"   {result}")

# Test 5: List completed tasks
print("\n5. Listing completed tasks...")
result = list_tasks(ctx, status="completed")
print(f"   {result}")

# Test 6: Update a task
print("\n6. Updating task 2...")
result = update_task(ctx, task_id=2, title="Call dentist for appointment", description="Ask about cleaning")
print(f"   {result}")

# Test 7: List all tasks again
print("\n7. Listing all tasks after updates...")
result = list_tasks(ctx, status="all")
print(f"   {result}")

# Test 8: Delete a task
print("\n8. Deleting task 3...")
result = delete_task(ctx, task_id=3)
print(f"   {result}")

# Test 9: Final list
print("\n9. Final task list...")
result = list_tasks(ctx, status="all")
print(f"   {result}")

print("\n" + "=" * 50)
print("All tests completed successfully!")
print("=" * 50)
