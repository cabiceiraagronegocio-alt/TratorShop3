#!/usr/bin/env python3
"""
TratorShop Onboarding Testing
Tests the onboarding functionality specifically
"""

import requests
import json
import sys
from datetime import datetime

class OnboardingTester:
    def __init__(self, base_url="https://0605c11c-4624-473a-bcf6-40c676c7e54c.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.session_token = None
        self.test_user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, test_name, success, status_code=None, error_msg=None, details=None):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {test_name} - PASSED")
            self.test_results.append({"test": test_name, "status": "PASSED", "details": details})
        else:
            print(f"❌ {test_name} - FAILED: {error_msg} (Status: {status_code})")
            self.test_results.append({"test": test_name, "status": "FAILED", "error": error_msg, "status_code": status_code})

    def register_and_login_test_user(self):
        """Register and login a test user for onboarding tests"""
        try:
            # Register new user
            user_data = {
                "email": "testeonboarding@teste.com",
                "password": "teste123456",
                "name": "Teste Onboarding"
            }
            
            # Try to register (might already exist)
            register_response = requests.post(f"{self.api_url}/auth/register", json=user_data)
            
            # Login the user
            login_data = {
                "email": "testeonboarding@teste.com",
                "password": "teste123456"
            }
            login_response = requests.post(f"{self.api_url}/auth/login", json=login_data)
            
            if login_response.status_code == 200:
                # Extract session token from cookies
                if 'set-cookie' in login_response.headers:
                    cookies = login_response.headers['set-cookie']
                    for cookie in cookies.split(';'):
                        if 'session_token=' in cookie:
                            self.session_token = cookie.split('session_token=')[1].split(';')[0]
                            break
                
                user_data = login_response.json()
                self.test_user_id = user_data.get("user_id")
                self.log_test("Register/Login test user", True, login_response.status_code, details=f"User ID: {self.test_user_id}")
                return True
            else:
                self.log_test("Register/Login test user", False, login_response.status_code, "Failed to login")
                return False
                
        except Exception as e:
            self.log_test("Register/Login test user", False, None, str(e))
            return False

    def test_user_profile_endpoint(self):
        """Test GET /api/user/profile to check onboarding status"""
        if not self.session_token:
            self.log_test("GET /api/user/profile", False, None, "No session token")
            return False
            
        try:
            headers = {"Cookie": f"session_token={self.session_token}"}
            response = requests.get(f"{self.api_url}/user/profile", headers=headers)
            
            success = response.status_code == 200
            if success:
                data = response.json()
                required_fields = ["user_id", "email", "name", "onboarding_complete", "account_type", "max_listings"]
                success = all(field in data for field in required_fields)
                onboarding_complete = data.get("onboarding_complete", False)
                self.log_test("GET /api/user/profile", success, response.status_code, 
                            details=f"Onboarding complete: {onboarding_complete}")
                return data
            else:
                self.log_test("GET /api/user/profile", False, response.status_code, "Failed to get profile")
                return None
                
        except Exception as e:
            self.log_test("GET /api/user/profile", False, None, str(e))
            return None

    def test_onboarding_individual(self):
        """Test completing onboarding as individual"""
        if not self.session_token:
            self.log_test("POST /api/user/onboarding (individual)", False, None, "No session token")
            return False
            
        try:
            headers = {"Cookie": f"session_token={self.session_token}"}
            onboarding_data = {
                "account_type": "individual"
            }
            
            response = requests.post(f"{self.api_url}/user/onboarding", json=onboarding_data, headers=headers)
            
            success = response.status_code == 200
            if success:
                data = response.json()
                success = (data.get("account_type") == "individual" and 
                          data.get("onboarding_complete") == True and
                          data.get("role") == "user" and
                          data.get("max_listings") == 3)
                self.log_test("POST /api/user/onboarding (individual)", success, response.status_code,
                            details=f"Account type: {data.get('account_type')}, Max listings: {data.get('max_listings')}")
                return success
            else:
                self.log_test("POST /api/user/onboarding (individual)", False, response.status_code, "Failed to complete onboarding")
                return False
                
        except Exception as e:
            self.log_test("POST /api/user/onboarding (individual)", False, None, str(e))
            return False

    def test_onboarding_dealer(self):
        """Test completing onboarding as dealer"""
        # First, register a new user for dealer test
        try:
            user_data = {
                "email": "testdealer@teste.com",
                "password": "teste123456",
                "name": "Teste Dealer"
            }
            requests.post(f"{self.api_url}/auth/register", json=user_data)
            
            # Login the dealer user
            login_data = {
                "email": "testdealer@teste.com",
                "password": "teste123456"
            }
            login_response = requests.post(f"{self.api_url}/auth/login", json=login_data)
            
            if login_response.status_code != 200:
                self.log_test("POST /api/user/onboarding (dealer)", False, login_response.status_code, "Failed to login dealer user")
                return False
            
            # Extract session token
            dealer_token = None
            if 'set-cookie' in login_response.headers:
                cookies = login_response.headers['set-cookie']
                for cookie in cookies.split(';'):
                    if 'session_token=' in cookie:
                        dealer_token = cookie.split('session_token=')[1].split(';')[0]
                        break
            
            if not dealer_token:
                self.log_test("POST /api/user/onboarding (dealer)", False, None, "Failed to get dealer token")
                return False
            
            headers = {"Cookie": f"session_token={dealer_token}"}
            onboarding_data = {
                "account_type": "dealer",
                "store_name": "Loja Teste Dealer"
            }
            
            response = requests.post(f"{self.api_url}/user/onboarding", json=onboarding_data, headers=headers)
            
            success = response.status_code == 200
            if success:
                data = response.json()
                success = (data.get("account_type") == "dealer" and 
                          data.get("onboarding_complete") == True and
                          data.get("role") == "dealer" and
                          data.get("dealer_profile", {}).get("store_name") == "Loja Teste Dealer")
                self.log_test("POST /api/user/onboarding (dealer)", success, response.status_code,
                            details=f"Account type: {data.get('account_type')}, Store: {data.get('dealer_profile', {}).get('store_name')}")
                return success
            else:
                self.log_test("POST /api/user/onboarding (dealer)", False, response.status_code, "Failed to complete dealer onboarding")
                return False
                
        except Exception as e:
            self.log_test("POST /api/user/onboarding (dealer)", False, None, str(e))
            return False

    def test_onboarding_invalid_type(self):
        """Test onboarding with invalid account type"""
        if not self.session_token:
            self.log_test("POST /api/user/onboarding (invalid)", False, None, "No session token")
            return False
            
        try:
            headers = {"Cookie": f"session_token={self.session_token}"}
            onboarding_data = {
                "account_type": "invalid_type"
            }
            
            response = requests.post(f"{self.api_url}/user/onboarding", json=onboarding_data, headers=headers)
            
            success = response.status_code == 400
            if success:
                data = response.json()
                success = "Tipo de conta inválido" in data.get("detail", "")
            self.log_test("POST /api/user/onboarding (invalid type)", success, response.status_code)
            return success
                
        except Exception as e:
            self.log_test("POST /api/user/onboarding (invalid type)", False, None, str(e))
            return False

    def test_dealer_without_store_name(self):
        """Test dealer onboarding without store name"""
        # Register another test user
        try:
            user_data = {
                "email": "testdealer2@teste.com",
                "password": "teste123456",
                "name": "Teste Dealer 2"
            }
            requests.post(f"{self.api_url}/auth/register", json=user_data)
            
            # Login
            login_data = {
                "email": "testdealer2@teste.com",
                "password": "teste123456"
            }
            login_response = requests.post(f"{self.api_url}/auth/login", json=login_data)
            
            if login_response.status_code != 200:
                self.log_test("POST /api/user/onboarding (dealer no store)", False, login_response.status_code, "Failed to login")
                return False
            
            # Extract session token
            dealer_token = None
            if 'set-cookie' in login_response.headers:
                cookies = login_response.headers['set-cookie']
                for cookie in cookies.split(';'):
                    if 'session_token=' in cookie:
                        dealer_token = cookie.split('session_token=')[1].split(';')[0]
                        break
            
            if not dealer_token:
                self.log_test("POST /api/user/onboarding (dealer no store)", False, None, "Failed to get token")
                return False
            
            headers = {"Cookie": f"session_token={dealer_token}"}
            onboarding_data = {
                "account_type": "dealer"
                # Missing store_name
            }
            
            response = requests.post(f"{self.api_url}/user/onboarding", json=onboarding_data, headers=headers)
            
            success = response.status_code == 400
            if success:
                data = response.json()
                success = "Nome da loja é obrigatório" in data.get("detail", "")
            self.log_test("POST /api/user/onboarding (dealer no store)", success, response.status_code)
            return success
                
        except Exception as e:
            self.log_test("POST /api/user/onboarding (dealer no store)", False, None, str(e))
            return False

    def run_all_tests(self):
        """Run all onboarding tests"""
        print("🚀 Starting TratorShop Onboarding Tests...\n")
        
        # Setup test user
        if not self.register_and_login_test_user():
            print("❌ Failed to setup test user, aborting tests")
            return
        
        # Test user profile endpoint
        profile = self.test_user_profile_endpoint()
        
        # Test onboarding completion
        self.test_onboarding_individual()
        
        # Test dealer onboarding
        self.test_onboarding_dealer()
        
        # Test invalid scenarios
        self.test_onboarding_invalid_type()
        self.test_dealer_without_store_name()
        
        # Print summary
        self.print_summary()

    def print_summary(self):
        """Print test summary"""
        print(f"\n📊 ONBOARDING TEST SUMMARY")
        print(f"Total tests: {self.tests_run}")
        print(f"Passed: {self.tests_passed}")
        print(f"Failed: {self.tests_run - self.tests_passed}")
        print(f"Success rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        if self.tests_passed < self.tests_run:
            print("\n❌ FAILED TESTS:")
            for result in self.test_results:
                if result["status"] == "FAILED":
                    print(f"  - {result['test']}: {result.get('error', 'Unknown error')}")
        else:
            print("\n✅ All onboarding tests passed!")

def main():
    tester = OnboardingTester()
    tester.run_all_tests()
    
    # Return exit code based on success
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())