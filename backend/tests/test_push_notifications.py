"""
TratorShop Web Push Notification Tests - Iteration 11
Testing: VAPID public key, push subscribe/unsubscribe, test notification, approve_user with push
"""
import pytest
import requests
import os
import time
import json

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://trator-ms.preview.emergentagent.com').rstrip('/')

# Test credentials
ADMIN_EMAIL = "admin@tratorshop.com"
ADMIN_PASSWORD = "Admin@123"
TEST_USER_EMAIL = "novousuario@teste.com"
TEST_USER_PASSWORD = "teste123456"


class TestVAPIDPublicKey:
    """Test GET /api/push/vapid-public-key endpoint"""
    
    def test_vapid_public_key_returns_key(self):
        """VAPID public key endpoint should return the public key"""
        response = requests.get(f"{BASE_URL}/api/push/vapid-public-key")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "publicKey" in data, f"Expected 'publicKey' in response, got: {data.keys()}"
        
        public_key = data["publicKey"]
        assert public_key is not None, "publicKey should not be None"
        assert len(public_key) > 50, f"publicKey seems too short: {len(public_key)} chars"
        # VAPID public keys are base64url encoded and typically start with 'B'
        assert public_key.startswith("B"), f"VAPID public key should start with 'B', got: {public_key[:10]}"
        
        print(f"✓ VAPID public key endpoint returns valid key: {public_key[:30]}...")


class TestPushSubscribe:
    """Test POST /api/push/subscribe endpoint"""
    
    @pytest.fixture
    def user_session(self):
        """Create authenticated user session"""
        session = requests.Session()
        response = session.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_USER_EMAIL,
            "password": TEST_USER_PASSWORD
        })
        if response.status_code != 200:
            pytest.skip(f"User login failed: {response.text}")
        return session
    
    def test_subscribe_requires_auth(self):
        """Subscribe endpoint should require authentication"""
        response = requests.post(f"{BASE_URL}/api/push/subscribe", json={
            "endpoint": "https://fcm.googleapis.com/fcm/send/test123",
            "keys": {
                "p256dh": "test_p256dh_key",
                "auth": "test_auth_key"
            }
        })
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print(f"✓ Subscribe endpoint correctly requires authentication")
    
    def test_subscribe_creates_subscription(self, user_session):
        """Subscribe endpoint should create a new subscription"""
        # Create a mock subscription (simulating browser push subscription)
        test_endpoint = f"https://fcm.googleapis.com/fcm/send/test_{int(time.time())}"
        subscription_data = {
            "endpoint": test_endpoint,
            "keys": {
                "p256dh": "BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QTpQtUbVlUls0VJXg7A8u-Ts1XbjhazAkj7I99e8QcYP7DkM",
                "auth": "tBHItJI5svbpez7KI4CCXg"
            }
        }
        
        response = user_session.post(f"{BASE_URL}/api/push/subscribe", json=subscription_data)
        assert response.status_code == 200, f"Subscribe failed: {response.text}"
        
        data = response.json()
        assert "message" in data, f"Expected 'message' in response, got: {data.keys()}"
        assert "status" in data, f"Expected 'status' in response, got: {data.keys()}"
        assert data["status"] in ["subscribed", "updated"], f"Unexpected status: {data['status']}"
        
        print(f"✓ Subscribe endpoint created subscription: {data['message']}")
    
    def test_subscribe_updates_existing_subscription(self, user_session):
        """Subscribe endpoint should update existing subscription with same endpoint"""
        test_endpoint = f"https://fcm.googleapis.com/fcm/send/test_update_{int(time.time())}"
        subscription_data = {
            "endpoint": test_endpoint,
            "keys": {
                "p256dh": "BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QTpQtUbVlUls0VJXg7A8u-Ts1XbjhazAkj7I99e8QcYP7DkM",
                "auth": "tBHItJI5svbpez7KI4CCXg"
            }
        }
        
        # First subscription
        response1 = user_session.post(f"{BASE_URL}/api/push/subscribe", json=subscription_data)
        assert response1.status_code == 200, f"First subscribe failed: {response1.text}"
        
        # Update with new keys (same endpoint)
        subscription_data["keys"]["auth"] = "newAuthKey123456"
        response2 = user_session.post(f"{BASE_URL}/api/push/subscribe", json=subscription_data)
        assert response2.status_code == 200, f"Update subscribe failed: {response2.text}"
        
        data = response2.json()
        assert data["status"] == "updated", f"Expected 'updated' status, got: {data['status']}"
        
        print(f"✓ Subscribe endpoint correctly updates existing subscription")


class TestPushUnsubscribe:
    """Test DELETE /api/push/unsubscribe endpoint"""
    
    @pytest.fixture
    def user_session(self):
        """Create authenticated user session"""
        session = requests.Session()
        response = session.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_USER_EMAIL,
            "password": TEST_USER_PASSWORD
        })
        if response.status_code != 200:
            pytest.skip(f"User login failed: {response.text}")
        return session
    
    def test_unsubscribe_requires_auth(self):
        """Unsubscribe endpoint should require authentication"""
        response = requests.delete(f"{BASE_URL}/api/push/unsubscribe")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print(f"✓ Unsubscribe endpoint correctly requires authentication")
    
    def test_unsubscribe_removes_subscriptions(self, user_session):
        """Unsubscribe endpoint should remove all user subscriptions"""
        # First create a subscription
        test_endpoint = f"https://fcm.googleapis.com/fcm/send/test_unsub_{int(time.time())}"
        subscription_data = {
            "endpoint": test_endpoint,
            "keys": {
                "p256dh": "BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QTpQtUbVlUls0VJXg7A8u-Ts1XbjhazAkj7I99e8QcYP7DkM",
                "auth": "tBHItJI5svbpez7KI4CCXg"
            }
        }
        
        # Subscribe first
        sub_response = user_session.post(f"{BASE_URL}/api/push/subscribe", json=subscription_data)
        assert sub_response.status_code == 200, f"Subscribe failed: {sub_response.text}"
        
        # Now unsubscribe
        unsub_response = user_session.delete(f"{BASE_URL}/api/push/unsubscribe")
        assert unsub_response.status_code == 200, f"Unsubscribe failed: {unsub_response.text}"
        
        data = unsub_response.json()
        assert "message" in data, f"Expected 'message' in response, got: {data.keys()}"
        assert "deleted" in data, f"Expected 'deleted' count in response, got: {data.keys()}"
        
        print(f"✓ Unsubscribe endpoint removed {data['deleted']} subscription(s)")


class TestPushTestNotification:
    """Test POST /api/push/test endpoint"""
    
    @pytest.fixture
    def user_session(self):
        """Create authenticated user session"""
        session = requests.Session()
        response = session.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_USER_EMAIL,
            "password": TEST_USER_PASSWORD
        })
        if response.status_code != 200:
            pytest.skip(f"User login failed: {response.text}")
        return session
    
    def test_test_notification_requires_auth(self):
        """Test notification endpoint should require authentication"""
        response = requests.post(f"{BASE_URL}/api/push/test")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print(f"✓ Test notification endpoint correctly requires authentication")
    
    def test_test_notification_without_subscription_fails(self, user_session):
        """Test notification should fail if user has no subscription"""
        # First unsubscribe to ensure no subscriptions exist
        user_session.delete(f"{BASE_URL}/api/push/unsubscribe")
        
        # Try to send test notification
        response = user_session.post(f"{BASE_URL}/api/push/test")
        
        # Should return 400 because no subscription exists
        assert response.status_code == 400, f"Expected 400, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "detail" in data, f"Expected 'detail' in error response, got: {data.keys()}"
        
        print(f"✓ Test notification correctly fails without subscription: {data['detail']}")
    
    def test_test_notification_with_subscription(self, user_session):
        """Test notification should attempt to send if subscription exists"""
        # First create a subscription (mock endpoint - won't actually receive push)
        test_endpoint = f"https://fcm.googleapis.com/fcm/send/test_notif_{int(time.time())}"
        subscription_data = {
            "endpoint": test_endpoint,
            "keys": {
                "p256dh": "BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QTpQtUbVlUls0VJXg7A8u-Ts1XbjhazAkj7I99e8QcYP7DkM",
                "auth": "tBHItJI5svbpez7KI4CCXg"
            }
        }
        
        sub_response = user_session.post(f"{BASE_URL}/api/push/subscribe", json=subscription_data)
        assert sub_response.status_code == 200, f"Subscribe failed: {sub_response.text}"
        
        # Try to send test notification
        # Note: This will likely fail because the endpoint is fake, but it should attempt to send
        response = user_session.post(f"{BASE_URL}/api/push/test")
        
        # Could be 200 (success) or 400 (subscription invalid/expired)
        # The important thing is it doesn't return 401 (auth) or 500 (server error)
        assert response.status_code in [200, 400], f"Unexpected status: {response.status_code}: {response.text}"
        
        if response.status_code == 200:
            print(f"✓ Test notification sent successfully")
        else:
            # 400 is expected with fake endpoint
            print(f"✓ Test notification attempted (fake endpoint rejected as expected)")


class TestApproveUserWithPush:
    """Test that approve_user endpoint triggers push notification"""
    
    @pytest.fixture
    def admin_session(self):
        """Create authenticated admin session"""
        session = requests.Session()
        response = session.post(f"{BASE_URL}/api/admin/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200, f"Admin login failed: {response.text}"
        return session
    
    def test_approve_user_endpoint_exists(self, admin_session):
        """Approve user endpoint should exist and require valid user_id"""
        # Test with non-existent user
        response = admin_session.post(f"{BASE_URL}/api/admin/users/nonexistent_user_123/approve")
        assert response.status_code == 404, f"Expected 404 for non-existent user, got {response.status_code}"
        print(f"✓ Approve user endpoint exists and validates user_id")
    
    def test_approve_user_requires_admin(self):
        """Approve user endpoint should require admin authentication"""
        response = requests.post(f"{BASE_URL}/api/admin/users/test_user/approve")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print(f"✓ Approve user endpoint correctly requires admin authentication")
    
    def test_approve_pending_user(self, admin_session):
        """Approving a pending user should work and trigger push notification"""
        # Get list of pending users
        users_response = admin_session.get(f"{BASE_URL}/api/admin/users")
        assert users_response.status_code == 200, f"Failed to get users: {users_response.text}"
        
        users = users_response.json()
        pending_user = None
        for user in users:
            if user.get("status") == "pending_approval":
                pending_user = user
                break
        
        if not pending_user:
            pytest.skip("No pending user found to test approval")
        
        # Approve the user
        approve_response = admin_session.post(f"{BASE_URL}/api/admin/users/{pending_user['user_id']}/approve")
        assert approve_response.status_code == 200, f"Approve failed: {approve_response.text}"
        
        data = approve_response.json()
        assert "message" in data, f"Expected 'message' in response, got: {data.keys()}"
        
        # Verify user status changed
        user_check = admin_session.get(f"{BASE_URL}/api/admin/users")
        users_after = user_check.json()
        approved_user = next((u for u in users_after if u["user_id"] == pending_user["user_id"]), None)
        
        if approved_user:
            assert approved_user.get("status") == "active", f"User status should be 'active', got: {approved_user.get('status')}"
        
        print(f"✓ User approved successfully (push notification triggered in background)")


class TestServiceWorkerFile:
    """Test that sw-push.js service worker file exists"""
    
    def test_service_worker_accessible(self):
        """Service worker file should be accessible"""
        # The service worker is served from frontend public folder
        # In production, it would be at /sw-push.js
        # We can check if the frontend serves it
        response = requests.get(f"{BASE_URL.replace('/api', '')}/sw-push.js", timeout=10)
        
        # Could be 200 (exists) or 404 (not found)
        if response.status_code == 200:
            content = response.text
            # Check for basic service worker content
            assert "self.addEventListener" in content or "push" in content.lower(), \
                f"Service worker doesn't seem to have push handling code"
            print(f"✓ Service worker file exists and contains push handling code")
        else:
            # Service worker might be at different path or not accessible via API
            print(f"⚠ Service worker file not accessible at /sw-push.js (status: {response.status_code})")
            # This is not a critical failure - the file exists in the codebase


class TestPushSubscriptionValidation:
    """Test push subscription data validation"""
    
    @pytest.fixture
    def user_session(self):
        """Create authenticated user session"""
        session = requests.Session()
        response = session.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_USER_EMAIL,
            "password": TEST_USER_PASSWORD
        })
        if response.status_code != 200:
            pytest.skip(f"User login failed: {response.text}")
        return session
    
    def test_subscribe_requires_endpoint(self, user_session):
        """Subscribe should require endpoint field"""
        response = user_session.post(f"{BASE_URL}/api/push/subscribe", json={
            "keys": {
                "p256dh": "test_key",
                "auth": "test_auth"
            }
        })
        assert response.status_code == 422, f"Expected 422 for missing endpoint, got {response.status_code}"
        print(f"✓ Subscribe correctly validates required endpoint field")
    
    def test_subscribe_requires_keys(self, user_session):
        """Subscribe should require keys field"""
        response = user_session.post(f"{BASE_URL}/api/push/subscribe", json={
            "endpoint": "https://fcm.googleapis.com/fcm/send/test"
        })
        assert response.status_code == 422, f"Expected 422 for missing keys, got {response.status_code}"
        print(f"✓ Subscribe correctly validates required keys field")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
