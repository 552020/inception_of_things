# IoT
- #vagrant #kubernetes
- # Docker environment
	- In this environment, Vagrant uses Docker as the provider instead of a hardware hypervisor due to privilege restrictions. The provisioning, networking, and orchestration layers remain identical; the main conceptual difference is that containers share the host kernel, whereas KVM-based VMs would provide full hardware isolation.
	-
	  ```
	  make
	  make run
	  ```
    ```
    make deepclean
    ```
	  ```
	  vagrant up --provider=docker
	  ```
- # Campus VM
	- TODO IP adresses are not given correctly
		- VM on campus has NAT inner VM's bridge - isuue ?
	- TODO install k3s
		- installation in Vagrantfile is untestet
	- ## commands
		-
		  ```
		  vagrant up
		  ```
		-
		  ```
		  vagrant status
		  ```
		-
		  ```
		  vagrant destroy
		  ```

curl --header "Host: app1.com" 192.168.56.110
curl --header "Host: app3.com" 192.168.56.110
