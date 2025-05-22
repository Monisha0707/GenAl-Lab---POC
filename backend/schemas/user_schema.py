# schemas/user_schema.py

def validate_user_data(data):
    if not data.get("name") or not isinstance(data.get("name"), str):
        return False, "Name is required and must be a string"
    if not data.get("email") or not isinstance(data.get("email"), str):
        return False, "Email is required and must be a string"
    if not data.get("password") or not isinstance(data.get("password"), str):
        return False, "Password is required and must be a string"
    return True, ""
