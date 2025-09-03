"""
Security validation for URL fetching and audit requests.
"""

import ipaddress
import re
from typing import List, Set
from urllib.parse import urlparse
import structlog

logger = structlog.get_logger(__name__)


class SecurityValidator:
    """Security validator for audit requests."""
    
    def __init__(self):
        # Private IP ranges
        self.private_networks = [
            ipaddress.ip_network("10.0.0.0/8"),
            ipaddress.ip_network("172.16.0.0/12"),
            ipaddress.ip_network("192.168.0.0/16"),
            ipaddress.ip_network("127.0.0.0/8"),
            ipaddress.ip_network("169.254.0.0/16"),  # Link-local
            ipaddress.ip_network("::1/128"),  # IPv6 localhost
            ipaddress.ip_network("fc00::/7"),  # IPv6 private
            ipaddress.ip_network("fe80::/10"),  # IPv6 link-local
        ]
        
        # Reserved IP ranges
        self.reserved_networks = [
            ipaddress.ip_network("0.0.0.0/8"),
            ipaddress.ip_network("100.64.0.0/10"),
            ipaddress.ip_network("192.0.0.0/24"),
            ipaddress.ip_network("192.0.2.0/24"),
            ipaddress.ip_network("192.88.99.0/24"),
            ipaddress.ip_network("198.18.0.0/15"),
            ipaddress.ip_network("198.51.100.0/24"),
            ipaddress.ip_network("203.0.113.0/24"),
            ipaddress.ip_network("224.0.0.0/4"),
            ipaddress.ip_network("240.0.0.0/4"),
        ]
        
        # Dangerous protocols
        self.dangerous_protocols = {
            "file", "ftp", "gopher", "jar", "javascript", "ldap", "mailto",
            "nntp", "sftp", "ssh", "telnet", "tftp", "data", "vbscript",
        }
        
        # Allowed protocols
        self.allowed_protocols = {"http", "https"}
    
    async def validate_url(self, url: str) -> None:
        """
        Validate URL for security risks.
        
        Args:
            url: URL to validate
            
        Raises:
            ValueError: If URL is not safe
        """
        try:
            parsed = urlparse(url)
            
            # Check protocol
            if parsed.scheme.lower() not in self.allowed_protocols:
                raise ValueError(f"Protocol not allowed: {parsed.scheme}")
            
            if parsed.scheme.lower() in self.dangerous_protocols:
                raise ValueError(f"Dangerous protocol: {parsed.scheme}")
            
            # Check for suspicious patterns
            self._check_suspicious_patterns(url)
            
            # Check hostname
            if parsed.hostname:
                await self._validate_hostname(parsed.hostname)
            
            # Check for SSRF patterns
            self._check_ssrf_patterns(url)
            
        except Exception as e:
            logger.warning("URL validation failed", url=url, error=str(e))
            raise ValueError(f"URL validation failed: {str(e)}")
    
    def _check_suspicious_patterns(self, url: str) -> None:
        """
        Check for suspicious URL patterns.
        
        Args:
            url: URL to check
            
        Raises:
            ValueError: If suspicious pattern found
        """
        suspicious_patterns = [
            r"@.*@",  # Multiple @ symbols
            r"#.*#",  # Multiple # symbols
            r"javascript:",  # JavaScript protocol
            r"data:",  # Data protocol
            r"vbscript:",  # VBScript protocol
            r"file:",  # File protocol
            r"ftp:",  # FTP protocol
            r"gopher:",  # Gopher protocol
            r"ldap:",  # LDAP protocol
            r"mailto:",  # Mailto protocol
            r"telnet:",  # Telnet protocol
            r"ssh:",  # SSH protocol
            r"sftp:",  # SFTP protocol
            r"tftp:",  # TFTP protocol
            r"jar:",  # JAR protocol
            r"nntp:",  # NNTP protocol
        ]
        
        for pattern in suspicious_patterns:
            if re.search(pattern, url, re.IGNORECASE):
                raise ValueError(f"Suspicious pattern detected: {pattern}")
    
    async def _validate_hostname(self, hostname: str) -> None:
        """
        Validate hostname for security risks.
        
        Args:
            hostname: Hostname to validate
            
        Raises:
            ValueError: If hostname is not safe
        """
        try:
            # Check if hostname resolves to private IP
            import socket
            ip = socket.gethostbyname(hostname)
            ip_obj = ipaddress.ip_address(ip)
            
            # Check against private networks
            for network in self.private_networks:
                if ip_obj in network:
                    raise ValueError(f"Hostname resolves to private IP: {ip}")
            
            # Check against reserved networks
            for network in self.reserved_networks:
                if ip_obj in network:
                    raise ValueError(f"Hostname resolves to reserved IP: {ip}")
            
        except socket.gaierror:
            # Hostname doesn't resolve, which is fine for validation
            pass
        except Exception as e:
            logger.warning("Hostname validation failed", hostname=hostname, error=str(e))
            raise
    
    def _check_ssrf_patterns(self, url: str) -> None:
        """
        Check for SSRF (Server-Side Request Forgery) patterns.
        
        Args:
            url: URL to check
            
        Raises:
            ValueError: If SSRF pattern found
        """
        ssrf_patterns = [
            r"localhost",
            r"127\.0\.0\.1",
            r"0\.0\.0\.0",
            r"::1",
            r"169\.254\.\d+\.\d+",  # Link-local
            r"10\.\d+\.\d+\.\d+",  # Private class A
            r"172\.(1[6-9]|2\d|3[01])\.\d+\.\d+",  # Private class B
            r"192\.168\.\d+\.\d+",  # Private class C
            r"file://",
            r"gopher://",
            r"ldap://",
            r"ldaps://",
            r"dict://",
            r"sftp://",
            r"tftp://",
            r"telnet://",
            r"ssh://",
        ]
        
        for pattern in ssrf_patterns:
            if re.search(pattern, url, re.IGNORECASE):
                raise ValueError(f"SSRF pattern detected: {pattern}")
    
    def validate_content_type(self, content_type: str) -> bool:
        """
        Validate content type for security.
        
        Args:
            content_type: Content type to validate
            
        Returns:
            True if content type is safe
        """
        dangerous_types = [
            "application/x-executable",
            "application/x-msdownload",
            "application/x-msdos-program",
            "application/x-winexe",
            "application/x-javascript",
            "text/javascript",
            "application/javascript",
            "text/vbscript",
            "application/x-vbscript",
        ]
        
        content_type_lower = content_type.lower()
        
        for dangerous_type in dangerous_types:
            if dangerous_type in content_type_lower:
                return False
        
        return True
    
    def validate_content_size(self, content_size: int, max_size: int = 10485760) -> bool:
        """
        Validate content size.
        
        Args:
            content_size: Size of content in bytes
            max_size: Maximum allowed size in bytes
            
        Returns:
            True if content size is acceptable
        """
        return content_size <= max_size
