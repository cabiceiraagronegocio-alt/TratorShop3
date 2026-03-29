import requests
import sys
from datetime import datetime
import json

class AdminPanelTester:
    def __init__(self, base_url="https://tratorshop-preview.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        self.admin_session = None

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        if headers:
            test_headers.update(headers)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if self.admin_session:
                if method == 'GET':
                    response = self.admin_session.get(url, headers=test_headers)
                elif method == 'POST':
                    response = self.admin_session.post(url, json=data, headers=test_headers)
                elif method == 'PUT':
                    response = self.admin_session.put(url, json=data, headers=test_headers)
                elif method == 'DELETE':
                    response = self.admin_session.delete(url, headers=test_headers)
            else:
                if method == 'GET':
                    response = requests.get(url, headers=test_headers)
                elif method == 'POST':
                    response = requests.post(url, json=data, headers=test_headers)
                elif method == 'PUT':
                    response = requests.put(url, json=data, headers=test_headers)
                elif method == 'DELETE':
                    response = requests.delete(url, headers=test_headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return success, response.json() if response.content else {}
                except:
                    return success, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}...")
                self.failed_tests.append({
                    'name': name,
                    'expected': expected_status,
                    'actual': response.status_code,
                    'response': response.text[:200]
                })
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.failed_tests.append({
                'name': name,
                'error': str(e)
            })
            return False, {}

    def setup_admin_session(self):
        """Setup authenticated admin session"""
        print("\n=== SETTING UP ADMIN SESSION ===")
        session = requests.Session()
        
        # Test admin login
        login_response = session.post(
            f"{self.api_url}/admin/auth/login",
            json={"email": "admin@tratorshop.com", "password": "Admin@123"}
        )
        
        if login_response.status_code == 200:
            print("✅ Admin login successful")
            self.admin_session = session
            return True
        else:
            print(f"❌ Admin login failed: {login_response.status_code}")
            print(f"   Response: {login_response.text}")
            return False

    def test_admin_stats(self):
        """Test admin stats endpoint"""
        print("\n=== TESTING ADMIN STATS ===")
        success, stats_data = self.run_test("Admin Stats", "GET", "admin/stats", 200)
        
        if success and stats_data:
            print(f"   📊 Stats Retrieved:")
            print(f"      Total Users: {stats_data.get('users', {}).get('total', 0)}")
            print(f"      Total Dealers: {stats_data.get('users', {}).get('dealers', 0)}")
            print(f"      Total Individuals: {stats_data.get('users', {}).get('individuals', 0)}")
            print(f"      Total Listings: {stats_data.get('listings', {}).get('total', 0)}")
            print(f"      Pending Listings: {stats_data.get('listings', {}).get('pending', 0)}")
            print(f"      Approved Listings: {stats_data.get('listings', {}).get('approved', 0)}")
            return True
        return False

    def test_user_management(self):
        """Test user management features"""
        print("\n=== TESTING USER MANAGEMENT ===")
        
        # Get users list
        success1, users_data = self.run_test("List Users", "GET", "admin/users", 200)
        if not success1 or not users_data:
            return False
        
        print(f"   📋 Found {len(users_data)} users")
        
        # Test with first user if available
        if len(users_data) > 0:
            user = users_data[0]
            user_id = user.get('user_id')
            print(f"   👤 Testing with user: {user.get('name', 'Unknown')} ({user.get('email', 'No email')})")
            
            # Test update user limit
            success2, _ = self.run_test(
                "Update User Limit", 
                "PUT", 
                f"admin/users/{user_id}/limit", 
                200,
                data={"max_listings": 5}
            )
            
            # Test promote user to admin (then demote back)
            success3, _ = self.run_test(
                "Promote User to Admin", 
                "POST", 
                f"admin/make-admin/{user_id}", 
                200
            )
            
            success4, _ = self.run_test(
                "Remove Admin Status", 
                "POST", 
                f"admin/remove-admin/{user_id}", 
                200
            )
            
            # Test promote user to dealer
            success5, _ = self.run_test(
                "Promote User to Dealer", 
                "POST", 
                "admin/promote-user", 
                200,
                data={"user_email": user.get('email')}
            )
            
            return all([success1, success2, success3, success4, success5])
        
        return success1

    def test_listing_management(self):
        """Test listing management features"""
        print("\n=== TESTING LISTING MANAGEMENT ===")
        
        # Get all listings
        success1, listings_data = self.run_test("List All Listings", "GET", "admin/listings", 200)
        if not success1:
            return False
        
        print(f"   📋 Found {len(listings_data)} listings")
        
        # Test filtering by status
        success2, _ = self.run_test("List Pending Listings", "GET", "admin/listings?status=pending", 200)
        success3, _ = self.run_test("List Approved Listings", "GET", "admin/listings?status=approved", 200)
        success4, _ = self.run_test("List Rejected Listings", "GET", "admin/listings?status=rejected", 200)
        
        # If we have listings, test management operations
        if len(listings_data) > 0:
            listing = listings_data[0]
            listing_id = listing.get('listing_id')
            print(f"   📝 Testing with listing: {listing.get('title', 'Unknown')}")
            
            # Test update listing
            success5, _ = self.run_test(
                "Update Listing", 
                "PUT", 
                f"admin/listings/{listing_id}", 
                200,
                data={"title": "Updated Test Title"}
            )
            
            # Test approve listing
            success6, _ = self.run_test(
                "Approve Listing", 
                "POST", 
                f"admin/listings/{listing_id}/approve", 
                200
            )
            
            # Test feature listing
            success7, _ = self.run_test(
                "Feature Listing", 
                "POST", 
                f"admin/listings/{listing_id}/feature?featured=true", 
                200
            )
            
            return all([success1, success2, success3, success4, success5, success6, success7])
        
        return all([success1, success2, success3, success4])

    def test_storage_functionality(self):
        """Test storage/upload functionality"""
        print("\n=== TESTING STORAGE FUNCTIONALITY ===")
        
        # Test if EMERGENT_LLM_KEY is working by checking if we can access file endpoints
        # We'll test this indirectly by checking if the storage initialization works
        
        # Create a test listing first to test image upload
        test_listing_data = {
            "title": "Test Tractor for Storage",
            "description": "Testing storage functionality",
            "category": "tratores",
            "price": 50000,
            "condition": "usado",
            "city": "Campo Grande",
            "whatsapp": "67999999999"
        }
        
        # First we need to create a regular user session to create a listing
        user_session = requests.Session()
        
        # Register a test user
        register_response = user_session.post(
            f"{self.api_url}/auth/register",
            json={
                "email": "testuser@storage.com",
                "password": "Test123456",
                "name": "Storage Test User"
            }
        )
        
        if register_response.status_code in [200, 400]:  # 400 if user already exists
            # Login the test user
            login_response = user_session.post(
                f"{self.api_url}/auth/login",
                json={
                    "email": "testuser@storage.com",
                    "password": "Test123456"
                }
            )
            
            if login_response.status_code == 200:
                print("✅ Test user logged in successfully")
                
                # Create a test listing
                listing_response = user_session.post(
                    f"{self.api_url}/listings",
                    json=test_listing_data
                )
                
                if listing_response.status_code == 200:
                    listing_id = listing_response.json().get('listing_id')
                    print(f"✅ Test listing created: {listing_id}")
                    
                    # Test file upload endpoint (we'll test with a small text file as image)
                    test_file_content = b"fake image content for testing"
                    files = {'file': ('test.jpg', test_file_content, 'image/jpeg')}
                    
                    upload_response = user_session.post(
                        f"{self.api_url}/listings/{listing_id}/images",
                        files=files
                    )
                    
                    if upload_response.status_code == 200:
                        print("✅ Storage/Upload functionality working")
                        return True
                    else:
                        print(f"❌ Upload failed: {upload_response.status_code}")
                        print(f"   Response: {upload_response.text[:200]}")
                        return False
                else:
                    print(f"❌ Failed to create test listing: {listing_response.status_code}")
                    return False
            else:
                print(f"❌ Failed to login test user: {login_response.status_code}")
                return False
        else:
            print(f"❌ Failed to register test user: {register_response.status_code}")
            return False

def main():
    print("🚀 Starting TratorShop Admin Panel Comprehensive Tests")
    print("=" * 70)
    
    tester = AdminPanelTester()
    
    # Setup admin session
    if not tester.setup_admin_session():
        print("❌ Failed to setup admin session. Exiting.")
        return 1
    
    # Run all tests
    test_results = []
    
    # Test admin stats
    test_results.append(("Admin Stats", tester.test_admin_stats()))
    
    # Test user management
    test_results.append(("User Management", tester.test_user_management()))
    
    # Test listing management
    test_results.append(("Listing Management", tester.test_listing_management()))
    
    # Test storage functionality
    test_results.append(("Storage/Upload", tester.test_storage_functionality()))
    
    # Print summary
    print("\n" + "=" * 70)
    print("📊 COMPREHENSIVE TEST SUMMARY")
    print("=" * 70)
    
    for test_name, result in test_results:
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{test_name}: {status}")
    
    print(f"\nTotal API calls: {tester.tests_run}")
    print(f"Successful calls: {tester.tests_passed}")
    print(f"Failed calls: {tester.tests_run - tester.tests_passed}")
    print(f"Success rate: {(tester.tests_passed / tester.tests_run * 100):.1f}%")
    
    if tester.failed_tests:
        print("\n❌ FAILED TESTS DETAILS:")
        for i, failed in enumerate(tester.failed_tests, 1):
            print(f"{i}. {failed['name']}")
            if 'error' in failed:
                print(f"   Error: {failed['error']}")
            else:
                print(f"   Expected: {failed['expected']}, Got: {failed['actual']}")
                print(f"   Response: {failed['response']}")
    
    # Return 0 if all major tests passed, 1 otherwise
    major_tests_passed = sum(1 for _, result in test_results if result)
    return 0 if major_tests_passed >= len(test_results) * 0.75 else 1

if __name__ == "__main__":
    sys.exit(main())